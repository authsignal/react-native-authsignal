import { NativeModules } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
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

let initialized = false;

const AuthsignalTOTPModule = NativeModules.AuthsignalTOTPModule
  ? NativeModules.AuthsignalTOTPModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalTotp {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async enroll(): Promise<AuthsignalResponse<EnrollTotpResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalTOTPModule.enroll();

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
      const data = await AuthsignalTOTPModule.verify(code);

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalTOTPModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
