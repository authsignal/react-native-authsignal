import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './error';
import type { AuthsignalResponse } from './types';

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

  async getCredential(): Promise<AuthsignalResponse<PushCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.getCredential();
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

  async addCredential(token: string): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.addCredential(token);
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

  async removeCredential(): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.removeCredential();
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

  async getChallenge(): Promise<AuthsignalResponse<string>> {
    await this.ensureModuleIsInitialized();

    try {
      return await AuthsignalPushModule.getChallenge();
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

  async updateChallenge(
    challengeId: string,
    approved: boolean,
    verificationCode: string | null
  ): Promise<AuthsignalResponse<boolean>> {
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

      if (ex instanceof Error) {
        return { error: ex.message };
      }

      throw ex;
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
