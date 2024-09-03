import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR } from './error';
import type {
  AuthsignalResponse,
  PushChallenge,
  PushCredential,
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

interface AddCredentialInput {
  token?: string;
  userAuthenticationRequired?: boolean;
}

interface UpdateChallengeInput {
  challengeId: string;
  approved: boolean;
  verificationCode?: string | null;
}

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
      const data = await AuthsignalPushModule.getCredential();

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

  async addCredential({
    token,
    userAuthenticationRequired = false,
  }: AddCredentialInput): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    const timeout = userAuthenticationRequired ? 60 : 0;
    const authorizationType = 0;

    try {
      const data =
        Platform.OS === 'android'
          ? await AuthsignalPushModule.addCredential(
              token,
              userAuthenticationRequired,
              timeout,
              authorizationType
            )
          : await AuthsignalPushModule.addCredential(
              token,
              userAuthenticationRequired
            );

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

  async removeCredential(): Promise<AuthsignalResponse<boolean>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.removeCredential();
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

  async getChallenge(): Promise<AuthsignalResponse<PushChallenge | undefined>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalPushModule.getChallenge();

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
