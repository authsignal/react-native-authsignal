import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR } from './error';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
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

const AuthsignalPasskeyModule = NativeModules.AuthsignalPasskey
  ? NativeModules.AuthsignalPasskey
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

  constructor({ tenantID, baseURL }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
  }

  async signUp({
    token,
    userName,
  }: PasskeySignUpInput): Promise<string | undefined> {
    await this.ensureModuleIsInitialized();

    return await AuthsignalPasskeyModule.signUp(token, userName);
  }

  async signIn({
    token,
    autofill = false,
  }: PasskeySignInInput): Promise<string | undefined> {
    await this.ensureModuleIsInitialized();

    if (Platform.OS === 'ios') {
      return AuthsignalPasskeyModule.signIn(token, autofill);
    } else if (token) {
      return AuthsignalPasskeyModule.signIn(token);
    } else {
      return undefined;
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
