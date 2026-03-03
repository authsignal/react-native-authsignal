import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalWhatsappModule, {
  type Spec as AuthsignalWhatsappModuleSpec,
} from './NativeAuthsignalWhatsappModule';
import type { AuthsignalResponse, VerifyInput, VerifyResponse } from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
}

const AuthsignalWhatsappModule = getNativeModule<AuthsignalWhatsappModuleSpec>(
  'AuthsignalWhatsappModule',
  NativeAuthsignalWhatsappModule
);

export class AuthsignalWhatsapp {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
  private initialized = false;

  constructor({ tenantID, baseURL, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;
  }

  async challenge(): Promise<AuthsignalResponse<void>> {
    await this.ensureModuleIsInitialized();

    try {
      await AuthsignalWhatsappModule.challenge();

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
      const data = (await AuthsignalWhatsappModule.verify(
        code
      )) as VerifyResponse;

      return { data };
    } catch (ex) {
      return this.handleError(ex);
    }
  }

  private async ensureModuleIsInitialized() {
    if (this.initialized) {
      return;
    }

    await AuthsignalWhatsappModule.initialize(this.tenantID, this.baseURL);

    this.initialized = true;
  }

  private handleError(ex: unknown) {
    if (this.enableLogging) {
      console.log(ex);
    }

    return handleErrorCodes(ex);
  }
}
