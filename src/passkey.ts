import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR, ErrorCode } from './error';
import type {
  AuthsignalResponse,
  SignInResponse,
  SignUpResponse,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface PasskeySignUpInput {
  token: string;
  userName?: string;
  displayName?: string;
}

interface PasskeySignInInput {
  action?: string;
  token?: string;
  autofill?: boolean;
  preferImmediatelyAvailableCredentials?: boolean;
}

let initialized = false;
let autofillRequestPending = false;

const AuthsignalPasskeyModule = NativeModules.AuthsignalPasskeyModule
  ? NativeModules.AuthsignalPasskeyModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalPasskey {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async signUp({
    token,
    userName,
    displayName,
  }: PasskeySignUpInput): Promise<AuthsignalResponse<SignUpResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPasskeyModule.signUp(
        token,
        userName,
        displayName
      );

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      if (ex instanceof Error) {
        return { error: ex.message };
      }

      throw ex;
    }
  }

  async signIn({
    action,
    token,
    autofill = false,
    preferImmediatelyAvailableCredentials = true,
  }: PasskeySignInInput = {}): Promise<AuthsignalResponse<SignInResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      if (autofill) {
        if (autofillRequestPending) {
          return {};
        } else {
          autofillRequestPending = true;
        }
      }

      if (Platform.OS === 'ios') {
        const data = await AuthsignalPasskeyModule.signIn(
          action,
          token,
          autofill,
          preferImmediatelyAvailableCredentials
        );

        autofillRequestPending = false;

        return { data };
      } else {
        const data = await AuthsignalPasskeyModule.signIn(action, token);

        autofillRequestPending = false;

        return { data };
      }
    } catch (ex) {
      if (this.enableLogging && !autofill) {
        console.log(ex);
      }

      autofillRequestPending = false;

      if (ex instanceof Error) {
        switch (ex.message) {
          case 'SIGN_IN_CANCELED':
            return {
              errorCode: ErrorCode.passkeySignInCanceled,
              error: 'Passkey sign-in canceled',
            };
          case 'SIGN_IN_NO_CREDENTIAL':
            return {
              errorCode: ErrorCode.noPasskeyCredentialAvailable,
              error: 'No passkey credential available',
            };
          default:
            return { error: ex.message };
        }
      }

      throw ex;
    }
  }

  cancel() {
    if (Platform.OS === 'ios') {
      AuthsignalPasskeyModule.cancel();
    }
  }

  async isAvailableOnDevice(): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return await AuthsignalPasskeyModule.isAvailableOnDevice();
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalPasskeyModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
