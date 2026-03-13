import { Platform } from 'react-native';

/**
 * Authsignal configuration
 * Get your credentials from: https://portal.authsignal.com
 */
export const AuthsignalConfig = {
  tenantId: '87902a54-1902-47a6-b492-43acb0dca6d2',
  baseUrl: 'https://api.authsignal.com/v1',
  backendUrl: Platform.select({
    web: 'http://localhost:3001',
    android: 'http://10.0.2.2:3001',
    default: 'http://192.168.1.3:3001',
  }),

  get isConfigured() {
    return this.tenantId.length > 0 && this.tenantId !== 'YOUR_TENANT_ID';
  },
};
