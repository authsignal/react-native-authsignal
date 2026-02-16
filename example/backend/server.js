#!/usr/bin/env node

const express = require('express');
const cors = require('cors');
const { Authsignal } = require('@authsignal/node');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

const AUTHSIGNAL_SECRET = process.env.AUTHSIGNAL_SECRET;
const AUTHSIGNAL_TENANT_ID = process.env.AUTHSIGNAL_TENANT_ID;
const AUTHSIGNAL_BASE_URL =
  process.env.AUTHSIGNAL_BASE_URL || 'https://api.authsignal.com/v1';

if (!AUTHSIGNAL_SECRET || !AUTHSIGNAL_TENANT_ID) {
  console.error('Missing required environment variables!');
  console.error(
    '   Copy .env.example to .env and update with your credentials'
  );
  process.exit(1);
}

const authsignal = new Authsignal({
  apiSecretKey: AUTHSIGNAL_SECRET,
  apiUrl: AUTHSIGNAL_BASE_URL,
});

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  if (Object.keys(req.body).length > 0) {
    console.log('  Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

app.post('/api/registration-token', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
      });
    }

    console.log(`  Tracking 'addAuthenticator' for user: ${userId}`);

    const trackResponse = await authsignal.track({
      userId,
      action: 'addAuthenticator',
      attributes: {
        scope: 'add:authenticators',
      },
    });

    console.log(`  Token generated (state: ${trackResponse.state})`);

    res.json({
      token: trackResponse.token,
      state: trackResponse.state,
      message: 'Use this token to add an authenticator',
    });
  } catch (error) {
    console.error('  Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate registration token',
      details: error.message,
    });
  }
});

app.post('/api/challenge-token', async (req, res) => {
  try {
    const { userId, phoneNumber, email } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'userId is required',
      });
    }

    console.log(`  Tracking 'signIn' for user: ${userId}`);

    const attributes = {};
    if (phoneNumber) attributes.phoneNumber = phoneNumber;
    if (email) attributes.email = email;

    const trackResponse = await authsignal.track({
      userId,
      action: 'signIn',
      attributes: Object.keys(attributes).length > 0 ? attributes : undefined,
    });

    console.log(`  Token generated (state: ${trackResponse.state})`);

    if (trackResponse.state === 'CHALLENGE_REQUIRED') {
      try {
        const userResponse = await authsignal.getUser({ userId });

        const deviceAuth = userResponse.userAuthenticators?.find(
          (auth) => auth.userAuthenticatorType === 'DEVICE'
        );

        if (deviceAuth) {
          console.log('  Creating device challenge...');
          const deviceChallengeResponse = await authsignal.createChallenge({
            userId,
            userAuthenticatorId: deviceAuth.userAuthenticatorId,
            action: 'signIn',
          });

          console.log(
            `  Device challenge created: ${deviceChallengeResponse.challengeId}`
          );

          return res.json({
            token: trackResponse.token,
            state: trackResponse.state,
            challengeId: deviceChallengeResponse.challengeId,
            message: 'Device challenge created',
          });
        }
      } catch (challengeError) {
        console.error('  Device challenge error:', challengeError.message);
      }
    }

    res.json({
      token: trackResponse.token,
      state: trackResponse.state,
      challengeId: trackResponse.challengeId,
      message: 'Challenge token generated',
    });
  } catch (error) {
    console.error('  Error:', error.message);
    res.status(500).json({
      error: 'Failed to generate challenge token',
      details: error.message,
    });
  }
});

app.post('/api/validate', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        error: 'token is required',
      });
    }

    console.log('  Validating token...');

    const validationResponse = await authsignal.validateChallenge({ token });

    console.log(`  Token validated (state: ${validationResponse.state})`);

    res.json({
      isValid: validationResponse.state === 'CHALLENGE_SUCCEEDED',
      state: validationResponse.state,
      userId: validationResponse.userId,
    });
  } catch (error) {
    console.error('  Error:', error.message);
    res.status(500).json({
      error: 'Failed to validate token',
      details: error.message,
    });
  }
});

app.get('/api/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`  Getting user: ${userId}`);

    const userResponse = await authsignal.getUser({ userId });

    console.log(
      `  User found with ${
        userResponse.userAuthenticators?.length || 0
      } authenticators`
    );

    res.json(userResponse);
  } catch (error) {
    console.error('  Error:', error.message);
    res.status(500).json({
      error: 'Failed to get user',
      details: error.message,
    });
  }
});

app.get('/', (req, res) => {
  res.json({
    name: 'Authsignal React Native Example Backend',
    version: '1.0.0',
    documentation: {
      endpoints: {
        'GET /health': 'Health check',
        'POST /api/registration-token': 'Get token for adding authenticators',
        'POST /api/challenge-token': 'Get token for authentication challenges',
        'POST /api/validate': 'Validate a completed challenge token',
        'GET /api/user/:userId': 'Get user information',
      },
    },
  });
});

app.listen(PORT, () => {
  console.log('');
  console.log('Authsignal React Native Example Backend');
  console.log('========================================');
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('Quick Test:');
  console.log(`   curl http://localhost:${PORT}/health`);
  console.log('');
  console.log(`For Android Emulator, use: http://10.0.2.2:${PORT}`);
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});
