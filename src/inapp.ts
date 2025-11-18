import { NativeModules, Platform } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type {
  AuthsignalResponse,
  AppCredential,
  InAppVerifyInput,
  InAppVerifyResponse,
  InAppAddCredentialInput,
  InAppGetCredentialInput,
  InAppRemoveCredentialInput,
  CreatePinInput,
  VerifyPinInput,
  VerifyPinResponse,
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

  async verify({ action, username }: InAppVerifyInput = {}): Promise<
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

  async createPin({
    pin,
    username,
    token,
  }: CreatePinInput): Promise<AuthsignalResponse<AppCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.createPin(pin, username, token);
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async verifyPin({
    pin,
    username,
    action,
  }: VerifyPinInput): Promise<AuthsignalResponse<VerifyPinResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.verifyPin(pin, username, action);
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async deletePin({
    username,
  }: VerifyPinInput): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.deletePin(username);
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async getAllUsernames(): Promise<AuthsignalResponse<string[]>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.getAllUsernames();
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
