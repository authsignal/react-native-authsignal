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


```bash
cd backend
npm install
cp .env.example .env
```

Add your credentials:
```env
AUTHSIGNAL_SECRET=your_secret_key
AUTHSIGNAL_BASE_URL=https://api.authsignal.com/v1
PORT=3000
```

Start the server:
```bash
npm run dev
```

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
