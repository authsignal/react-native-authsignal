import { Platform } from 'react-native';
import { handleErrorCodes } from './error';
import { getNativeModule } from './getNativeModule';
import NativeAuthsignalPasskeyModule, {
  type Spec as AuthsignalPasskeyModuleSpec,
} from './NativeAuthsignalPasskeyModule';
import type {
  AuthsignalResponse,
  SignInResponse,
  SignUpResponse,
} from './types';

interface ConstructorArgs {
  tenantID: string;
  baseURL: string;
  deviceID?: string;
  enableLogging: boolean;
}

interface PasskeySignUpInput {
  token?: string;
  username?: string;
  displayName?: string;
  ignorePasskeyAlreadyExistsError?: boolean;
}

interface PasskeySignInInput {
  action?: string;
  token?: string;
  autofill?: boolean;
  preferImmediatelyAvailableCredentials?: boolean;
}

const AuthsignalPasskeyModule = getNativeModule<AuthsignalPasskeyModuleSpec>(
  'AuthsignalPasskeyModule',
  NativeAuthsignalPasskeyModule
);

export class AuthsignalPasskey {
  tenantID: string;
  baseURL: string;
  deviceID?: string;
  enableLogging: boolean;
  private initialized = false;
  private autofillRequestPending = false;

  constructor({ tenantID, baseURL, deviceID, enableLogging }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.deviceID = deviceID;
    this.enableLogging = enableLogging;
  }

  async signUp({
    token,
    username,
    displayName,
    ignorePasskeyAlreadyExistsError = false,
  }: PasskeySignUpInput = {}): Promise<AuthsignalResponse<SignUpResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      const data = (await AuthsignalPasskeyModule.signUp(
        token ?? null,
        username ?? null,
        displayName ?? null,
        ignorePasskeyAlreadyExistsError
      )) as SignUpResponse;

      return { data };
    } catch (ex) {
      if (this.enableLogging) {
        console.log(ex);
      }

      return handleErrorCodes(ex);
    }
  }

  async signIn({
    action,
    token,
    autofill = false,
    preferImmediatelyAvailableCredentials = true,
  }: PasskeySignInInput = {}): Promise<AuthsignalResponse<SignInResponse>> {
    await this.ensureModuleIsInitialized();

    try {
      if (autofill) {
        if (this.autofillRequestPending) {
          return {};
        } else {
          this.autofillRequestPending = true;
        }
      }

      const data = (await AuthsignalPasskeyModule.signIn(
        action ?? null,
        token ?? null,
        autofill,
        preferImmediatelyAvailableCredentials
      )) as SignInResponse;

      this.autofillRequestPending = false;

      return { data };
    } catch (ex) {
      if (this.enableLogging && !autofill) {
        console.log(ex);
      }

      this.autofillRequestPending = false;

      return handleErrorCodes(ex);
    }
  }

  cancel() {
    this.autofillRequestPending = false;
    AuthsignalPasskeyModule.cancel();
  }

  isSupported(): boolean {
    if (Platform.OS === 'android') {
      return Platform.Version >= 28;
    } else if (Platform.OS === 'ios') {
      return parseInt(Platform.Version, 10) >= 15;
    } else {
      return false;
    }
  }

  async shouldPromptToCreatePasskey({
    username,
  }: { username?: string } = {}): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return await AuthsignalPasskeyModule.shouldPromptToCreatePasskey(
      username ?? null
    );
  }

  /**
   * @deprecated Use 'preferImmediatelyAvailableCredentials' to control what happens when a passkey isn't available, or use 'shouldPromptToCreatePasskey' to check if you should prompt the user to create a passkey.
   */
  async isAvailableOnDevice(): Promise<boolean> {
    await this.ensureModuleIsInitialized();

    return await AuthsignalPasskeyModule.isAvailableOnDevice();
  }

  private async ensureModuleIsInitialized() {
    if (this.initialized) {
      return;
    }

    await AuthsignalPasskeyModule.initialize(
      this.tenantID,
      this.baseURL,
      this.deviceID ?? null
    );

    this.initialized = true;
  }
}
