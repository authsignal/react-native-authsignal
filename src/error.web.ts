export enum ErrorCode {
  user_canceled = 'user_canceled',
  no_credential = 'no_credential',
  matched_excluded_credential = 'matched_excluded_credential',
  token_not_set = 'token_not_set',
  token_required = 'token_required',
  token_invalid = 'token_invalid',
}

export function handleErrorCodes(ex: any) {
  const message =
    ex?.errorDescription ?? ex?.message ?? ex?.error ?? String(ex);
  const code = ex?.errorCode ?? ex?.code ?? undefined;

  return {
    error: message,
    errorCode: code,
  } as ErrorResponse;
}

interface ErrorResponse {
  error: string;
  errorCode: string;
}
