import { Authsignal as AuthsignalBrowser } from '@authsignal/browser';

let client: AuthsignalBrowser | null = null;
let currentTenantID: string | null = null;
let currentBaseURL: string | null = null;

interface WebClientConfig {
  tenantID: string;
  baseURL: string;
  enableLogging?: boolean;
}

export function getOrCreateWebClient({
  tenantID,
  baseURL,
  enableLogging = false,
}: WebClientConfig): AuthsignalBrowser {
  if (!client || tenantID !== currentTenantID || baseURL !== currentBaseURL) {
    client = new AuthsignalBrowser({
      tenantId: tenantID,
      baseUrl: baseURL,
      enableLogging,
    });
    currentTenantID = tenantID;
    currentBaseURL = baseURL;
  }

  return client;
}
