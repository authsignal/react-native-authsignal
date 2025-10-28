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

const AuthsignalQRCodeModule = NativeModules.AuthsignalQRCodeModule
  ? NativeModules.AuthsignalQRCodeModule
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

  async getCredential(): Promise<
    AuthsignalResponse<AppCredential | undefined>
  > {
    await this.ensureModuleIsInitialized();

    try {
      const data = await AuthsignalQRCodeModule.getCredential();

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
          ? await AuthsignalQRCodeModule.addCredential(
              token,
              requireUserAuthentication,
              keychainAccess
            )
          : await AuthsignalQRCodeModule.addCredential(token);

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
      const data = await AuthsignalQRCodeModule.removeCredential();
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
      const data = await AuthsignalQRCodeModule.claimChallenge(challengeId);

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
      const data = await AuthsignalQRCodeModule.updateChallenge(
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

    await AuthsignalQRCodeModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }
}
