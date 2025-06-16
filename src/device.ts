import { NativeModules, Platform } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type {
  AuthsignalResponse,
  ClaimChallengeResponse,
  DeviceChallenge,
  DeviceCredential,
  KeychainAccess,
  VerifyDeviceResponse,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

let initialized = false;

const AuthsignalDeviceModule = NativeModules.AuthsignalDeviceModule
  ? NativeModules.AuthsignalDeviceModule
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
  requireUserAuthentication?: boolean;
  keychainAccess?: KeychainAccess;
}

interface ClaimChallengeInput {
  challengeId: string;
}

interface UpdateChallengeInput {
  challengeId: string;
  approved: boolean;
  verificationCode?: string | null;
}

export class AuthsignalDevice {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async getCredential(): Promise<AuthsignalResponse<DeviceCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalDeviceModule.getCredential();

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
  }: AddCredentialInput = {}): Promise<AuthsignalResponse<DeviceCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data =
        Platform.OS === 'ios'
          ? await AuthsignalDeviceModule.addCredential(
              token,
              requireUserAuthentication,
              keychainAccess
            )
          : await AuthsignalDeviceModule.addCredential(token);

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
      const data = await AuthsignalDeviceModule.removeCredential();
      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async getChallenge(): Promise<
    AuthsignalResponse<DeviceChallenge | undefined>
  > {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalDeviceModule.getChallenge();

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async claimChallenge({
    challengeId,
  }: ClaimChallengeInput): Promise<AuthsignalResponse<ClaimChallengeResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalDeviceModule.claimChallenge(challengeId);

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
      const data = await AuthsignalDeviceModule.updateChallenge(
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

  async verify(): Promise<AuthsignalResponse<VerifyDeviceResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalDeviceModule.verify();

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

    await AuthsignalDeviceModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
