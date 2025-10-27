import type { ErrorCode } from './error';

export interface AuthsignalResponse<T> {
  data?: T;
  error?: string;
  errorCode?: ErrorCode | string;
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
  userAuthenticatorId?: string;
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

export interface AddCredentialInput {
  token?: string;
  requireUserAuthentication?: boolean;
  keychainAccess?: KeychainAccess;
}

export interface AppChallenge {
  challengeId: string;
  actionCode?: string;
  idempotencyKey?: string;
  userAgent?: string;
  deviceId?: string;
  ipAddress?: string;
}

export interface AppCredential {
  credentialId: string;
  createdAt: string;
  userId: string;
  lastAuthenticatedAt?: string;
}

export interface ClaimChallengeInput {
  challengeId: string;
}

export interface ClaimChallengeResponse {
  success: boolean;
  userAgent?: string;
  ipAddress?: string;
}

export interface UpdateChallengeInput {
  challengeId: string;
  approved: boolean;
  verificationCode?: string | null;
}

export interface InAppVerifyResponse {
  token: string;
  userId: string;
  userAuthenticatorId: string;
  username?: string;
}

export enum KeychainAccess {
  afterFirstUnlock = 'afterFirstUnlock',
  afterFirstUnlockThisDeviceOnly = 'afterFirstUnlockThisDeviceOnly',
  whenUnlocked = 'whenUnlocked',
  whenUnlockedThisDeviceOnly = 'whenUnlockedThisDeviceOnly',
  whenPasscodeSetThisDeviceOnly = 'whenPasscodeSetThisDeviceOnly',
}

export enum UserActionState {
  ALLOW = 'ALLOW',
  BLOCK = 'BLOCK',
  CHALLENGE_REQUIRED = 'CHALLENGE_REQUIRED',
  CHALLENGE_SUCCEEDED = 'CHALLENGE_SUCCEEDED',
  CHALLENGE_FAILED = 'CHALLENGE_FAILED',
  REVIEW_REQUIRED = 'REVIEW_REQUIRED',
  REVIEW_SUCCEEDED = 'REVIEW_SUCCEEDED',
  REVIEW_FAILED = 'REVIEW_FAILED',
}
