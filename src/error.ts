import { Platform } from 'react-native';

export const LINKING_ERROR =
  `The package 'react-native-authsignal' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo Go\n';

export enum ErrorCode {
  user_canceled = 'user_canceled',
  no_credential = 'no_credential',
  token_not_set = 'token_not_set',
  token_required = 'token_required',
  token_invalid = 'token_invalid',
}

export function handleErrorCodes(ex: any) {
  return {
    error: ex.message,
    errorCode: ex.code,
  } as ErrorResponse;
}

interface ErrorResponse {
  error: string;
  errorCode: string;
}
