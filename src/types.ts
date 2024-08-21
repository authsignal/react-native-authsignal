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
  username?: string;
  displayName?: string;
}

export interface VerifyInput {
  code: string;
}

export interface VerifyResponse {
  isVerified: boolean;
  token?: string;
  failureReason?: string;
}

export interface PushCredential {
  credentialId: string;
  createdAt: string;
  lastAuthenticatedAt?: string;
}

export interface PushChallenge {
  challengeId: string;
  actionCode?: string;
  idempotencyKey?: string;
  userAgent?: string;
  deviceId?: string;
  ipAddress?: string;
}
