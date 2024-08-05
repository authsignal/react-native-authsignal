import type { ErrorCode } from './error';

export interface AuthsignalResponse<T> {
  data?: T;
  error?: string;
  errorCode?: ErrorCode;
}

export interface TokenPayload {
  aud: string;
  exp: number;
  iat: number;
  other: {
    actionCode: string;
    idempotencyKey: string;
    publishableKey: string;
    tenantId: string;
    userId: string;
    username: string;
  };
  scope?: string;
  sub: string;
}

export interface SignUpResponse {
  token: string;
}

export interface SignInResponse {
  isVerified: boolean;
  token?: string;
  userId?: string;
  userAuthenticatorI?: string;
  userName?: string;
  userDisplayName?: string;
}
