import { getOrCreateWebClient } from './web-client';
import { handleErrorCodes } from './error';
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

    if (ex?.name === 'NotAllowedError') {
      return {
        error: ex.message ?? 'User cancelled the operation',
        errorCode: 'user_canceled',
      };
    }

    if (ex?.name === 'InvalidStateError') {
      return {
        error: ex.message ?? 'Credential already exists',
        errorCode: 'matched_excluded_credential',
      };
    }

    return handleErrorCodes(ex);
  }
}
