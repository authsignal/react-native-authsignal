import { NativeModules, Platform } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type {
  AddCredentialInput,
  AppChallenge,
  AppCredential,
  AuthsignalResponse,
  UpdateChallengeInput,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

let initialized = false;

const AuthsignalPushModule = NativeModules.AuthsignalPushModule
  ? NativeModules.AuthsignalPushModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalPush {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async getCredential(): Promise<
    AuthsignalResponse<AppCredential | undefined>
  > {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.getCredential();

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
  }: AddCredentialInput = {}): Promise<AuthsignalResponse<AppCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data =
        Platform.OS === 'ios'
          ? await AuthsignalPushModule.addCredential(
              token,
              requireUserAuthentication,
              keychainAccess
            )
          : await AuthsignalPushModule.addCredential(token);

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async removeCredential(): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.removeCredential();
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async getChallenge(): Promise<AuthsignalResponse<AppChallenge | undefined>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.getChallenge();

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async updateChallenge({
    challengeId,
    approved,
    verificationCode = null,
  }: UpdateChallengeInput): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.updateChallenge(
        challengeId,
        approved,
        verificationCode
      );

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

    await AuthsignalPushModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
