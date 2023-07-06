import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './error';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface PushCredential {
  credentialID: string;
  createdAt: string;
  lastAuthenticatedAt?: string;
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

  async getCredential(): Promise<PushCredential | undefined> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.getCredential();
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

      return undefined;
    }
  }

  async addCredential(token: string): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.addCredential(token);
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

      return false;
    }
  }

  async removeCredential(): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.removeCredential();
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

      return false;
    }
  }

  async getChallenge(): Promise<string | undefined> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.getChallenge();
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

      return undefined;
    }
  }

  async updateChallenge(
    challengeId: string,
    approved: boolean,
    verificationCode: string | null
  ): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    try {
      return await NativeModules.updateChallenge(
        challengeId,
        approved,
        verificationCode
      );
    } catch (ex) {
      if (this.enableLogging) {
        console.warn(ex);
      }

      return false;
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
