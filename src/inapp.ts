import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalInAppModule, {
  type Spec as AuthsignalInAppModuleSpec,
} from './NativeAuthsignalInAppModule';
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
  DeletePinInput,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

const AuthsignalInAppModule = getNativeModule<AuthsignalInAppModuleSpec>(
  'AuthsignalInAppModule',
  NativeAuthsignalInAppModule
);

export class AuthsignalInApp {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
  private initialized = false;

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
      const data = (await AuthsignalInAppModule.getCredential(
        username ?? null
      )) as AppCredential | undefined;

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
    performAttestation,
  }: InAppAddCredentialInput = {}): Promise<AuthsignalResponse<AppCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = (await AuthsignalInAppModule.addCredential(
        token ?? null,
        requireUserAuthentication,
        keychainAccess ?? null,
        username ?? null,
        performAttestation ?? false
      )) as AppCredential;

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
      const data = await AuthsignalInAppModule.removeCredential(
        username ?? null
      );
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
      const data = (await AuthsignalInAppModule.verify(
        action ?? null,
        username ?? null
      )) as InAppVerifyResponse;

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
      const data = (await AuthsignalInAppModule.createPin(
        pin,
        username,
        token ?? null
      )) as AppCredential;
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
      const data = (await AuthsignalInAppModule.verifyPin(
        pin,
        username,
        action ?? null
      )) as VerifyPinResponse;
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
  }: DeletePinInput): Promise<AuthsignalResponse<boolean>> {
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

  async getAllPinUsernames(): Promise<AuthsignalResponse<string[]>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalInAppModule.getAllPinUsernames();
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (this.initialized) {
      return;
    }

    await AuthsignalInAppModule.initialize(this.tenantID, this.baseURL);

    this.initialized = true;
  }
}
