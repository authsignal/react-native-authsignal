import { NativeModules, Platform } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type {
  AddCredentialInput,
  AppCredential,
  AuthsignalResponse,
  ClaimChallengeInput,
  ClaimChallengeResponse,
  UpdateChallengeInput,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

let initialized = false;

const AuthsignalQrCodeModule = NativeModules.AuthsignalQrCodeModule
  ? NativeModules.AuthsignalQrCodeModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalQrCode {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async getCredential(): Promise<AuthsignalResponse<AppCredential>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalQrCodeModule.getCredential();

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
          ? await AuthsignalQrCodeModule.addCredential(
              token,
              requireUserAuthentication,
              keychainAccess
            )
          : await AuthsignalQrCodeModule.addCredential(token);

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
      const data = await AuthsignalQrCodeModule.removeCredential();
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
      const data = await AuthsignalQrCodeModule.claimChallenge(challengeId);

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
      const data = await AuthsignalQrCodeModule.updateChallenge(
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

    await AuthsignalQrCodeModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
