import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR } from './error';
import { AuthsignalEmail } from './email';
import { AuthsignalPasskey } from './passkey';
import { AuthsignalPush } from './push';
import { AuthsignalSms } from './sms';
import { AuthsignalTotp } from './totp';
import { AuthsignalDevice } from './device';
import { AuthsignalWhatsapp } from './whatsapp';

export * from './types';
export { ErrorCode } from './error';

const AuthsignalModule = NativeModules.AuthsignalModule
  ? NativeModules.AuthsignalModule
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
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
  device: AuthsignalDevice;
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

    this.passkey = new AuthsignalPasskey({
      tenantID,
      baseURL,
      deviceID,
      enableLogging,
    });

    this.email = new AuthsignalEmail({ tenantID, baseURL, enableLogging });
    this.push = new AuthsignalPush({ tenantID, baseURL, enableLogging });
    this.device = new AuthsignalDevice({ tenantID, baseURL, enableLogging });
    this.sms = new AuthsignalSms({ tenantID, baseURL, enableLogging });
    this.totp = new AuthsignalTotp({ tenantID, baseURL, enableLogging });
    this.whatsapp = new AuthsignalWhatsapp({
      tenantID,
      baseURL,
      enableLogging,
    });
  }

  async setToken(token: string): Promise<void> {
    await AuthsignalModule.setToken(token);
  }

  async launch(url: string): Promise<string | null> {
    return await launch(url);
  }
}

export function launch(url: string): Promise<string | null> {
  if (Platform.OS === 'ios') {
    return AuthsignalModule.launch(url);
  } else {
    return new Promise((resolve, reject) => {
      const callback = (error: any, token: string) => {
        if (token) {
          resolve(token);
        } else if (error) {
          if (error.error === 'user_cancelled') {
            resolve(null);
          } else {
            reject(error);
          }
        } else {
          reject('Unexpected error');
        }
      };

      AuthsignalModule.launch(url, callback);
    });
  }
}
