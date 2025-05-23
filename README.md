<img width="1070" alt="Authsignal" src="https://raw.githubusercontent.com/authsignal/react-native-authsignal/main/.github/images/authsignal.png">

# Authsignal React Native SDK

Check out our [official React Native documentation](https://docs.authsignal.com/sdks/client/react-native).

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

For more detailed info on how add passkeys to your app using Authsignal, check out our [official passkey documentation for React Native](https://docs.authsignal.com/sdks/client/react-native#passkeys).

### Push

To see how to add push authentication to your app using Authsignal, see our [official push documentation for React Native](https://docs.authsignal.com/sdks/client/react-native#push).

## Examples

### Passkeys

You can check out [this Github repo](https://github.com/authsignal/cognito-react-native-example) to see an example app which implements a sign-in with passkey flow using the Authsignal React Native SDK, Amazon Cognito and AWS SDK.

