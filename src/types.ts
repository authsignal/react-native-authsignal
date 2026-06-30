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
  performAttestation?: boolean;
  pushToken?: string;
}

export interface AppChallenge {
  challengeId: string;
  actionCode?: string;
  idempotencyKey?: string;
  userAgent?: string;
  deviceId?: string;
  ipAddress?: string;
  custom?: Record<string, unknown>;
  user?: ChallengeUser;
}

export interface ChallengeUser {
  custom?: Record<string, unknown>;
}

export interface AppCredential {
  credentialId: string;
  createdAt: string;
  userId: string;
  lastAuthenticatedAt?: string;
  /** ISO timestamp at which the credential lease expires, if the credential has an expiry. */
  expiresAt?: string;
  /** True if the credential lease has expired. */
  isExpired?: boolean;
}

export interface UpdateCredentialInput {
  /**
   * The device's current push token (FCM/APNs). Optional — when omitted, the
   * server preserves the stored token.
   */
  pushToken?: string;
  /**
   * When `true`, resets the credential lease (keep-alive). When omitted or
   * `false`, the call only updates the push token without resetting the lease.
   */
  resetExpiry?: boolean;
}

export interface UpdatedAppCredential {
  userAuthenticatorId: string;
  userId: string;
  lastVerifiedAt: string;
  pushToken: string;
}

export interface ClaimChallengeInput {
  challengeId: string;
}

export interface ClaimChallengeResponse {
  success: boolean;
  userAgent?: string;
  ipAddress?: string;
  actionCode?: string;
  idempotencyKey?: string;
  custom?: Record<string, unknown>;
  user?: ChallengeUser;
}

export interface UpdateChallengeInput {
  challengeId: string;
  approved: boolean;
  verificationCode?: string | null;
}

export interface InAppGetCredentialInput {
  username?: string;
}

export interface InAppAddCredentialInput extends AddCredentialInput {
  username?: string;
}

export interface InAppRemoveCredentialInput {
  username?: string;
}

export interface InAppVerifyInput {
  action?: string;
  username?: string;
}

export interface InAppVerifyResponse {
  token: string;
  userId: string;
  userAuthenticatorId: string;
  username?: string;
}

export interface CreatePinInput {
  pin: string;
  username: string;
  token?: string;
}

export interface VerifyPinInput {
  pin: string;
  username: string;
  action?: string;
}

export interface VerifyPinResponse {
  isVerified: boolean;
  token?: string;
  userId?: string;
}

export interface DeletePinInput {
  username: string;
}

export interface LaunchOptions {
  mode?: 'popup' | 'redirect';
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
