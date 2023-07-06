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
      return await AuthsignalPasskeyModule.signUp(token, userName);
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
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
      if (autofill && Platform.OS !== 'ios') {
        throw new Error('autofill is only supported on iOS');
      }

      return await AuthsignalPasskeyModule.signIn(token, autofill);
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

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
