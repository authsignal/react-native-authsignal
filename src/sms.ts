import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalSMSModule, {
  type Spec as AuthsignalSMSModuleSpec,
} from './NativeAuthsignalSMSModule';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface EnrollSmsInput {
  phoneNumber: string;
}

const AuthsignalSMSModule = getNativeModule<AuthsignalSMSModuleSpec>(
  'AuthsignalSMSModule',
  NativeAuthsignalSMSModule
);

export class AuthsignalSms {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
  private initialized = false;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async enroll({
    phoneNumber,
  }: EnrollSmsInput): Promise<AuthsignalResponse<void>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalSMSModule.enroll(phoneNumber);

      return {};
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async challenge(): Promise<AuthsignalResponse<void>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalSMSModule.challenge();

      return {};
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async verify({
    code,
  }: VerifyInput): Promise<AuthsignalResponse<VerifyResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = (await AuthsignalSMSModule.verify(code)) as VerifyResponse;

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (this.initialized) {
      return;
    }

    await AuthsignalSMSModule.initialize(this.tenantID, this.baseURL);

    this.initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
