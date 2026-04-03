import { getNativeModule } from './getNativeModule';
import NativeAuthsignalModule, {
  type Spec as AuthsignalModuleSpec,
} from './NativeAuthsignalModule';
import { AuthsignalEmail } from './email';
import { AuthsignalPasskey } from './passkey';
import { AuthsignalPush } from './push';
import { AuthsignalSms } from './sms';
import { AuthsignalTotp } from './totp';
import { AuthsignalQrCode } from './qr';
import { AuthsignalWhatsapp } from './whatsapp';
import { AuthsignalInApp } from './inapp';
import type { LaunchOptions } from './types';

export * from './types';
export { ErrorCode } from './error';

const AuthsignalModule = getNativeModule<AuthsignalModuleSpec>(
  'AuthsignalModule',
  NativeAuthsignalModule
);

interface ConstructorArgs {
  tenantID: string;
  baseURL?: string;
  deviceID?: string;
  enableLogging?: boolean;
}

export class Authsignal {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  email: AuthsignalEmail;
  passkey: AuthsignalPasskey;
  push: AuthsignalPush;
  qr: AuthsignalQrCode;
  inapp: AuthsignalInApp;
  sms: AuthsignalSms;
  totp: AuthsignalTotp;
  whatsapp: AuthsignalWhatsapp;

  constructor({
    tenantID,
    baseURL = 'https://api.authsignal.com/v1',
    deviceID,
    enableLogging = __DEV__,
  }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;

    const input = { tenantID, baseURL, deviceID, enableLogging };

    this.passkey = new AuthsignalPasskey(input);
    this.email = new AuthsignalEmail(input);
    this.push = new AuthsignalPush(input);
    this.qr = new AuthsignalQrCode(input);
    this.inapp = new AuthsignalInApp(input);
    this.sms = new AuthsignalSms(input);
    this.totp = new AuthsignalTotp(input);
    this.whatsapp = new AuthsignalWhatsapp(input);
  }

  async setToken(token: string): Promise<void> {
    await AuthsignalModule.setToken(token);
  }

  async launch(url: string, _options?: LaunchOptions): Promise<string | null> {
    return await launch(url);
  }

  async getDeviceId(): Promise<string> {
    return await getDeviceId();
  }
}

export async function getDeviceId(): Promise<string> {
  return AuthsignalModule.getDeviceId();
}

export function launch(
  url: string,
  _options?: LaunchOptions
): Promise<string | null> {
  return AuthsignalModule.launch(url);
}
