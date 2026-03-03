import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalTOTPModule, {
  type Spec as AuthsignalTOTPModuleSpec,
} from './NativeAuthsignalTOTPModule';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface EnrollTotpResponse {
  uri: string;
  secret: string;
}

const AuthsignalTOTPModule = getNativeModule<AuthsignalTOTPModuleSpec>(
  'AuthsignalTOTPModule',
  NativeAuthsignalTOTPModule
);

export class AuthsignalTotp {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
  private initialized = false;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async enroll(): Promise<AuthsignalResponse<EnrollTotpResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = (await AuthsignalTOTPModule.enroll()) as EnrollTotpResponse;

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async verify({
    code,
  }: VerifyInput): Promise<AuthsignalResponse<VerifyResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = (await AuthsignalTOTPModule.verify(code)) as VerifyResponse;

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (this.initialized) {
      return;
    }

    await AuthsignalTOTPModule.initialize(this.tenantID, this.baseURL);

    this.initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
