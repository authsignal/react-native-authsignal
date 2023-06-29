import { NativeModules } from 'react-native';
import { LINKING_ERROR } from './error';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
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

  constructor({ tenantID, baseURL }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
  }

  async getCredential(): Promise<PushCredential | undefined> {
    await this.ensureModuleIsInitialized();

    return AuthsignalPushModule.getCredential();
  }

  async addCredential(token: string): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return AuthsignalPushModule.addCredential(token);
  }

  async removeCredential(): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return AuthsignalPushModule.removeCredential();
  }

  async getChallenge(): Promise<string | undefined> {
    await this.ensureModuleIsInitialized();

    return AuthsignalPushModule.getChallenge();
  }

  async updateChallenge(
    challengeId: string,
    approved: boolean,
    verificationCode: string | null
  ): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return NativeModules.updateChallenge(
      challengeId,
      approved,
      verificationCode
    );
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalPushModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
