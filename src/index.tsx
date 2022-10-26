import { NativeModules, Platform } from 'react-native';

const LINKING_ERROR =
  `The package 'react-native-authsignal' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

const Authsignal = NativeModules.Authsignal
  ? NativeModules.Authsignal
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export function showUrl(url: string): Promise<string | null> {
  if (Platform.OS === 'ios') {
    return Authsignal.showUrl(url);
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

      Authsignal.showUrl(url, callback);
    });
  }
}
