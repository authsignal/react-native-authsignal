import { NativeModules } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface EnrollSmsInput {
  phoneNumber: string;
}

let initialized = false;

const AuthsignalSMSModule = NativeModules.AuthsignalSMSModule
  ? NativeModules.AuthsignalSMSModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalSms {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

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
      const data = await AuthsignalSMSModule.verify(code);

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalSMSModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
