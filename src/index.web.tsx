import { getOrCreateWebClient } from './web-client';
import { AuthsignalEmail } from './email';
import { AuthsignalPasskey } from './passkey';
import { AuthsignalSms } from './sms';
import { AuthsignalTotp } from './totp';
import { AuthsignalWhatsapp } from './whatsapp';
import type { LaunchOptions } from './types';

export * from './types';
export { ErrorCode } from './error';

interface ConstructorArgs {
  tenantID: string;
  baseURL?: string;
  deviceID?: string;
  enableLogging?: boolean;
}

let _lastClient: {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;
} | null = null;

export class Authsignal {
  tenantID: string;
  baseURL: string;
  enableLogging: boolean;

  email: AuthsignalEmail;
  passkey: AuthsignalPasskey;
  sms: AuthsignalSms;
  totp: AuthsignalTotp;
  whatsapp: AuthsignalWhatsapp;

  constructor({
    tenantID,
    baseURL = 'https://api.authsignal.com/v1',
    deviceID,
    enableLogging = false,
  }: ConstructorArgs) {
    this.tenantID = tenantID;
    this.baseURL = baseURL;
    this.enableLogging = enableLogging;

    _lastClient = { tenantID, baseURL, enableLogging };

    const input = { tenantID, baseURL, enableLogging };

    this.passkey = new AuthsignalPasskey({ ...input, deviceID });
    this.email = new AuthsignalEmail(input);
    this.sms = new AuthsignalSms(input);
    this.totp = new AuthsignalTotp(input);
    this.whatsapp = new AuthsignalWhatsapp(input);
  }

  async setToken(token: string): Promise<void> {
    const client = getOrCreateWebClient({
      tenantID: this.tenantID,
      baseURL: this.baseURL,
      enableLogging: this.enableLogging,
    });

    client.setToken(token);
  }

  async launch(url: string, options?: LaunchOptions): Promise<string | null> {
    return await launch(url, options);
  }

  async getDeviceId(): Promise<string> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return crypto.randomUUID();
    }

    const existingId = localStorage.getItem(DEVICE_ID_KEY);

    if (existingId) {
      return existingId;
    }

    const newId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, newId);

    return newId;
  }
}

export function launch(
  url: string,
  options?: LaunchOptions
): Promise<string | null> {
  if (_lastClient) {
    const client = getOrCreateWebClient({
      tenantID: _lastClient.tenantID,
      baseURL: _lastClient.baseURL,
      enableLogging: _lastClient.enableLogging,
    });

    if (options?.mode === 'redirect') {
      client.launch(url, { mode: 'redirect' });
      return Promise.resolve(null);
    }

    return client.launch(url, { mode: 'popup' }).then((result) => {
      return result?.token ?? null;
    });
  }

  // Fallback if no Authsignal instance has been created yet
  if (typeof window !== 'undefined') {
    window.open(url, '_blank');
  }

  return Promise.resolve(null);
}

const DEVICE_ID_KEY = '@as_device_id';
