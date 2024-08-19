import { NativeModules } from 'react-native';
import { handleErrorCodes, LINKING_ERROR } from './error';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface EnrollEmailInput {
  email: string;
}

let initialized = false;

const AuthsignalEmailModule = NativeModules.AuthsignalEmailModule
  ? NativeModules.AuthsignalEmailModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export class AuthsignalEmail {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async enroll({ email }: EnrollEmailInput): Promise<AuthsignalResponse<void>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalEmailModule.enroll(email);

      return {};
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async challenge(): Promise<AuthsignalResponse<void>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalEmailModule.challenge();

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
      const data = await AuthsignalEmailModule.verify(code);

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (initialized) {
      return;
    }

    await AuthsignalEmailModule.initialize(this.tenantID, this.baseURL);

    initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
