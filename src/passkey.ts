import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR } from './error';
import type { AuthsignalResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface PasskeySignUpInput {
  token: string;
  userName?: string;
}

interface PasskeySignInInput {
  token?: string;
  autofill?: boolean;
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
  }: PasskeySignUpInput): Promise<AuthsignalResponse<string>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPasskeyModule.signUp(token, userName);

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
    token,
    autofill = false,
  }: PasskeySignInInput): Promise<AuthsignalResponse<string>> {
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
        const data = await AuthsignalPasskeyModule.signIn(token, autofill);

        autofillRequestPending = false;

        return { data };
      } else {
        const data = await AuthsignalPasskeyModule.signIn(token);

        autofillRequestPending = false;

        return { data };
      }
    } catch (ex) {
      if (this.enableLogging && !autofill) {
        console.log(ex);
      }

      autofillRequestPending = false;

      if (ex instanceof Error) {
        return { error: ex.message };
      }

      throw ex;
    }
  }

  cancel() {
    if (Platform.OS === 'ios') {
      AuthsignalPasskeyModule.cancel();
    }
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalPasskeyModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
