import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR, handleErrorCodes } from './error';
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
  token?: string;
  username?: string;
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
    username,
    displayName,
  }: PasskeySignUpInput = {}): Promise<AuthsignalResponse<SignUpResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPasskeyModule.signUp(
        token,
        username,
        displayName
      );

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
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
        const data = await AuthsignalPasskeyModule.signIn(
          action,
          token,
          preferImmediatelyAvailableCredentials
        );

        autofillRequestPending = false;

        return { data };
      }
    } catch (ex) {
      if (this.enableLogging && !autofill) {
        console.log(ex);
      }

      autofillRequestPending = false;

      return handleErrorCodes(ex);
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
