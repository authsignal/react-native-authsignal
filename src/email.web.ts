import { getOrCreateWebClient } from './web-client';
import { handleErrorCodes } from './error';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

interface EnrollEmailInput {
  email: string;
}

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
    try {
      const client = this.getClient();
      const result = await client.email.enroll({ email });

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {};
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async challenge(): Promise<AuthsignalResponse<void>> {
    try {
      const client = this.getClient();
      const result = await client.email.challenge();

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {};
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async verify({
    code,
  }: VerifyInput): Promise<AuthsignalResponse<VerifyResponse>> {
    try {
      const client = this.getClient();
      const result = await client.email.verify({ code });

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {
        data: result.data
          ? {
              isVerified: result.data.isVerified,
              token: result.data.token,
              failureReason: result.data.failureReason,
            }
          : undefined,
      };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private getClient() {
    return getOrCreateWebClient({
      tenantID: this.tenantID,
      baseURL: this.baseURL,
      enableLogging: this.enableLogging,
    });
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
