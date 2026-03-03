import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalQRCodeModule, {
  type Spec as AuthsignalQRCodeModuleSpec,
} from './NativeAuthsignalQRCodeModule';
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

const AuthsignalQRCodeModule = getNativeModule<AuthsignalQRCodeModuleSpec>(
  'AuthsignalQRCodeModule',
  NativeAuthsignalQRCodeModule
);

export class AuthsignalQrCode {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
  private initialized = false;

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
      const data = (await AuthsignalQRCodeModule.getCredential()) as
        | AppCredential
        | undefined;

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
      const data = (await AuthsignalQRCodeModule.addCredential(
        token ?? null,
        requireUserAuthentication,
        keychainAccess ?? null
      )) as AppCredential;

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
      const data = (await AuthsignalQRCodeModule.claimChallenge(
        challengeId
      )) as ClaimChallengeResponse;

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
    if (this.initialized) {
      return;
    }

    await AuthsignalQRCodeModule.initialize(this.tenantID, this.baseURL);

    this.initialized = true;
  }
}
