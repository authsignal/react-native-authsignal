import { getOrCreateWebClient } from './web-client';
import { handleErrorCodes } from './error';
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
    try {
      const client = this.getClient();
      const result = await client.totp.enroll();

      if (result.errorCode) {
        return {
          error: result.errorDescription ?? result.error,
          errorCode: result.errorCode,
        };
      }

      return {
        data: result.data
          ? {
              uri: result.data.uri,
              secret: result.data.secret,
            }
          : undefined,
      };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  async verify({
    code,
  }: VerifyInput): Promise<AuthsignalResponse<VerifyResponse>> {
    try {
      const client = this.getClient();
      const result = await client.totp.verify({ code });

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
