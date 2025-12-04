<img width="1070" alt="Authsignal" src="https://raw.githubusercontent.com/authsignal/react-native-authsignal/main/.github/images/authsignal.png">

# Authsignal React Native SDK

Check out our [official Mobile SDK documentation](https://docs.authsignal.com/sdks/client/mobile/setup).

## Installation

Install the Authsignal React Native SDK using npm or yarn:

```bash
npm install react-native-authsignal
```

Then link the native iOS dependencies:

```bash
npx pod-install ios
```

## Initialization

Initialize the Authsignal client in your code:

```ts
import { Authsignal } from 'react-native-authsignal';

const authsignal = new Authsignal({
  tenantId: 'YOUR_TENANT_ID',
  baseUrl: 'YOUR_REGION_BASE_URL',
});
```

You can find your `tenantId` in the [Authsignal Portal](https://portal.authsignal.com/organisations/tenants/api).

You must specify the correct `baseUrl` for your tenant's region.

| Region      | Base URL                         |
| ----------- | -------------------------------- |
| US (Oregon) | https://api.authsignal.com/v1    |
| AU (Sydney) | https://au.api.authsignal.com/v1 |
| EU (Dublin) | https://eu.api.authsignal.com/v1 |

## Usage

### Passkeys

For more detailed info on how add passkeys to your app using Authsignal, check out our [passkey documentation for Mobile SDKs](https://docs.authsignal.com/authentication-methods/passkey/mobile-sdks).

### App verification

To see how to add app verification with push notifications or QR codes, see our [app verification documentation for Mobile SDKs](https://docs.authsignal.com/authentication-methods/app-verification/push).

## Examples

### Passkeys

You can check out [this Github repo](https://github.com/authsignal/mobile-sdk-example) to see an example app which implements a sign-in with passkey flow using the Authsignal React Native SDK.
