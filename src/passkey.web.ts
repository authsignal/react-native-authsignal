import { getOrCreateWebClient } from './web-client';
import { handleErrorCodes, ErrorCode } from './error';
import type {
  AuthsignalResponse,
  SignInResponse,
  SignUpResponse,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  deviceID?: string;
  enableLogging: boolean;
}

interface PasskeySignUpInput {
  token?: string;
  username?: string;
  displayName?: string;
  ignorePasskeyAlreadyExistsError?: boolean;
}

interface PasskeySignInInput {
  action?: string;
  token?: string;
  autofill?: boolean;
  preferImmediatelyAvailableCredentials?: boolean;
}

export class AuthsignalPasskey {
  tenantID: string;
  baseURL: string;
  deviceID?: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, deviceID, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.deviceID = deviceID;
    this.enableLogging = enableLogging;
  }

  async signUp({
    token,
    username,
    displayName,
    ignorePasskeyAlreadyExistsError = false,
  }: PasskeySignUpInput = {}): Promise<AuthsignalResponse<SignUpResponse>> {
    try {
      const client = this.getClient();
      const result = await client.passkey.signUp({
        token,
        username,
        displayName,
      });

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {
        data: result.data ? { token: result.data.token! } : undefined,
      };
    } catch (ex: any) {
      if (ignorePasskeyAlreadyExistsError && ex?.name === 'InvalidStateError') {
        return {};
      }

      return this.handleWebAuthnError(ex);
    }
  }

  async signIn({
    action,
    token,
    autofill = false,
    preferImmediatelyAvailableCredentials:
      _preferImmediatelyAvailableCredentials = true,
  }: PasskeySignInInput = {}): Promise<AuthsignalResponse<SignInResponse>> {
    try {
      const client = this.getClient();
      const result = await client.passkey.signIn({
        action,
        token,
        autofill,
      });

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {
        data: result.data
          ? {
              isVerified: result.data.isVerified,
              token: result.data.token,
              userId: result.data.userId,
              userAuthenticatorId: result.data.userAuthenticatorId,
              username: result.data.username,
              displayName: result.data.displayName,
            }
          : undefined,
      };
    } catch (ex) {
      return this.handleWebAuthnError(ex);
    }
  }

  cancel() {
    // On web, passkey operations are managed by the browser
    // and cannot be programmatically cancelled
  }

  isSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.PublicKeyCredential !== 'undefined'
    );
  }

  async shouldPromptToCreatePasskey({
    username: _username,
  }: { username?: string } = {}): Promise<boolean> {
    // On web, always return true if WebAuthn is supported
    return this.isSupported();
  }

  /**
   * @deprecated Use 'preferImmediatelyAvailableCredentials' to control what happens when a passkey isn't available, or use 'shouldPromptToCreatePasskey' to check if you should prompt the user to create a passkey.
   */
  async isAvailableOnDevice(): Promise<boolean> {
    return this.isSupported();
  }

  private getClient() {
    return getOrCreateWebClient({
      tenantID: this.tenantID,
      baseURL: this.baseURL,
      enableLogging: this.enableLogging,
    });
  }

  private handleWebAuthnError(ex: any) {
    if (this.enableLogging) {
      console.log(ex);
    }

    // Map WebAuthn errors to our error codes
    if (ex?.name === 'NotAllowedError') {
      return {
        error: ex.message ?? 'User cancelled the operation',
        errorCode: ErrorCode.user_canceled,
      };
    }

    if (ex?.name === 'InvalidStateError') {
      return {
        error: ex.message ?? 'Credential already exists',
        errorCode: ErrorCode.matched_excluded_credential,
      };
    }

    return handleErrorCodes(ex);
  }
}
