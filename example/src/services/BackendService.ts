import { AuthsignalConfig } from '../config';

export interface TokenResponse {
  token: string;
  state?: string;
  message?: string;
}

export interface ChallengeTokenResponse {
  token: string;
  state?: string;
  challengeId?: string;
  message?: string;
}

export interface LaunchUrlResponse {
  url: string;
  token: string;
  state?: string;
}

export interface ValidationResponse {
  isValid: boolean;
  state?: string;
  userId?: string;
}

class BackendServiceImpl {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? AuthsignalConfig.backendUrl;
  }

  async getRegistrationToken(userId: string): Promise<TokenResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/registration-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          token: data.token,
          state: data.state,
          message: data.message,
        };
      } else {
        console.log(`Failed to get registration token: ${response.status}`);
        return null;
      }
    } catch (e) {
      console.log(`Backend connection error: ${e}`);
      console.log(`Make sure your backend is running at: ${this.baseUrl}`);
      return null;
    }
  }

  async getChallengeToken({
    userId,
    phoneNumber,
    email,
  }: {
    userId: string;
    phoneNumber?: string;
    email?: string;
  }): Promise<ChallengeTokenResponse | null> {
    try {
      const body: Record<string, string> = { userId };
      if (phoneNumber) body.phoneNumber = phoneNumber;
      if (email) body.email = email;

      const response = await fetch(`${this.baseUrl}/api/challenge-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          token: data.token,
          state: data.state,
          challengeId: data.challengeId,
          message: data.message,
        };
      } else {
        console.log(`Failed to get challenge token: ${response.status}`);
        return null;
      }
    } catch (e) {
      console.log(`Backend connection error: ${e}`);
      return null;
    }
  }

  async validateToken(token: string): Promise<ValidationResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          isValid: data.isValid ?? false,
          state: data.state,
          userId: data.userId,
        };
      }
      return null;
    } catch (e) {
      console.log(`Validation error: ${e}`);
      return null;
    }
  }

  async getLaunchUrl(userId: string): Promise<LaunchUrlResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/api/launch-url`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      if (response.ok) {
        return await response.json();
      }
      console.log(`Failed to get launch URL: ${response.status}`);
      return null;
    } catch (e) {
      console.log(`Backend connection error: ${e}`);
      return null;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });

      clearTimeout(timeout);
      return response.ok;
    } catch {
      return false;
    }
  }
}

export const BackendService = new BackendServiceImpl();
