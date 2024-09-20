import { Platform } from 'react-native';

export const LINKING_ERROR =
  `The package 'react-native-authsignal' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export enum ErrorCode {
  tokenRequired = 'tokenRequired',
  passkeySignInCanceled = 'passkeySignInCanceled',
  noPasskeyCredentialAvailable = 'noPasskeyCredentialAvailable',
}

export function handleErrorCodes(ex: unknown) {
  if (ex instanceof Error) {
    if (ex.message === 'token_not_set') {
      return {
        error: 'Token is required. Call `setToken` first.',
        errorCode: ErrorCode.tokenRequired,
      };
    } else {
      return {
        error: ex.message,
      };
    }
  }

  throw ex;
}
