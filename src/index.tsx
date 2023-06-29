import { NativeModules, Platform } from 'react-native';
import { LINKING_ERROR } from './error';
import { AuthsignalPasskey } from './passkey';
import { AuthsignalPush } from './push';

const AuthsignalModule = NativeModules.Authsignal
  ? NativeModules.Authsignal
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
}

export class Authsignal {
  tenantID: string;
  baseURL: string;

  passkey: AuthsignalPasskey;
  push: AuthsignalPush;

  constructor({
    tenantID,
    baseURL = 'https://challenge.authsignal.com/v1',
  }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;

    this.passkey = new AuthsignalPasskey({ tenantID, baseURL });
    this.push = new AuthsignalPush({ tenantID, baseURL });
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
