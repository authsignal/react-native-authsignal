# Authsignal React Native SDK - Example App

Example app showing how to integrate the Authsignal React Native SDK.

## Quick Start

### 1. Prerequisites

- Node.js >= 16
- Expo CLI (`npx expo`)
- iOS Simulator or Android Emulator (for mobile testing)
- A web browser (for web testing)
- An Authsignal account with tenant ID and API secret

### 2. Configure your credentials

Update `src/config.ts` with your Authsignal credentials:

```typescript
export const AuthsignalConfig = {
  tenantId: 'YOUR_TENANT_ID',
  baseUrl: 'https://api.authsignal.com/v1',
  backendUrl: 'http://localhost:3000',
};
```

### 3. Set up backend server

The example requires a backend server to generate tokens. This server uses the Authsignal Node.js SDK.

**Security:** Only use an API secret key from a non-production tenant when running this server.

```bash
cd backend
npm install
cp .env.example .env
```

Edit `backend/.env` with your credentials:
```env
AUTHSIGNAL_SECRET=your_secret_key
AUTHSIGNAL_TENANT_ID=your_tenant_id
AUTHSIGNAL_BASE_URL=https://api.authsignal.com/v1
PORT=3000
```

Start the server:
```bash
npm run dev
```

See [backend/README.md](backend/README.md) for detailed backend documentation.

### 4. Install dependencies

```bash
cd example
npm install
```

### 5. Run the example app

**Web:**
```bash
npx expo start --web
```

**iOS:**
```bash
npx expo start --ios
```

**Android:**
```bash
npx expo start --android
```

## Web Support

This example demonstrates React Native Web support using `@authsignal/browser` under the hood. The same Authsignal SDK API works across all platforms:

| Feature | iOS | Android | Web |
|---------|-----|---------|-----|
| Passkeys | Yes | Yes | Yes |
| Email OTP | Yes | Yes | Yes |
| SMS OTP | Yes | Yes | Yes |
| WhatsApp OTP | Yes | Yes | Yes |
| TOTP | Yes | Yes | Yes |
| Push | Yes | Yes | No |
| QR Code | Yes | Yes | No |
| In-App | Yes | Yes | No |

## Architecture

The web support works using React Native's platform-specific file extensions:

- `email.ts` - Native implementation (iOS/Android)
- `email.web.ts` - Web implementation (wraps `@authsignal/browser`)

The bundler automatically picks the `.web.ts` file when building for web, and the `.ts` file when building for native platforms.

## Learn More

- [Authsignal documentation](https://docs.authsignal.com)
- [React Native SDK reference](https://docs.authsignal.com/sdks/client/react-native)
- [Web SDK reference](https://docs.authsignal.com/sdks/client/web)
- [API reference](https://docs.authsignal.com/api-reference/overview)
