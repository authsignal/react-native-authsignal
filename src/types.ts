export interface AuthsignalResponse<T> {
  data?: T;
  error?: string;
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
