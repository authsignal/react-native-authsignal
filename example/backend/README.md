# Example Backend Server

A simple Node.js backend for testing the Authsignal React Native SDK.

## Quick Start

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment:**
```bash
cp .env.example .env
```

Edit `.env` with your [Authsignal Portal](https://portal.authsignal.com) credentials:
```env
AUTHSIGNAL_SECRET=your_secret_key
AUTHSIGNAL_TENANT_ID=your_tenant_id
AUTHSIGNAL_BASE_URL=https://api.authsignal.com/v1
```

3. **Start the server:**
```bash
npm run dev
```

Server runs on `http://localhost:3000`

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/registration-token` | POST | Get token for adding authenticators |
| `/api/challenge-token` | POST | Get token for authentication |
| `/api/validate` | POST | Validate challenge token |
| `/api/user/:userId` | GET | Get user info |

## Testing with Emulators

**Android Emulator:** Use `http://10.0.2.2:3000`
**iOS Simulator:** Use `http://localhost:3000`
**Web:** Use `http://localhost:3000`

## Regional Base URLs

| Region | Base URL |
|--------|----------|
| US | `https://api.authsignal.com/v1` |
| AU | `https://au.api.authsignal.com/v1` |
| EU | `https://eu.api.authsignal.com/v1` |
| CA | `https://ca.api.authsignal.com/v1` |
