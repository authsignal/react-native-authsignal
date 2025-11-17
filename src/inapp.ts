import { NativeModules, Platform } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type {
  AuthsignalResponse,
  AppCredential,
  InAppVerifyRequest,
  InAppVerifyResponse,
  InAppAddCredentialInput,
  InAppGetCredentialInput,
  InAppRemoveCredentialInput,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

let initialized = false;

const AuthsignalInAppModule = NativeModules.AuthsignalInAppModule
  ? NativeModules.AuthsignalInAppModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalInApp {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async getCredential({
    username,
  }: InAppGetCredentialInput): Promise<
    AuthsignalResponse<AppCredential | undefined>
  > {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.getCredential(username);

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async addCredential({
    token,
    requireUserAuthentication = false,
    keychainAccess,
    username,
  }: InAppAddCredentialInput = {}): Promise<AuthsignalResponse<AppCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data =
        Platform.OS === 'ios'
          ? await AuthsignalInAppModule.addCredential(
              token,
              requireUserAuthentication,
              keychainAccess,
              username
            )
          : await AuthsignalInAppModule.addCredential(token, username);

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async removeCredential({
    username,
  }: InAppRemoveCredentialInput): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.removeCredential(username);
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async verify({ action, username }: InAppVerifyRequest = {}): Promise<
    AuthsignalResponse<InAppVerifyResponse>
  > {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.verify(action, username);

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalInAppModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
