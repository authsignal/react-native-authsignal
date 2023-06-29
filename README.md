# react-native-authsignal

The official Authsignal library for React Native.

## Installation

```sh
npm install react-native-authsignal
```

## Usage

```js
import { launch } from 'react-native-authsignal';

const token = await launch(url);

if (token) {
  // Send token to backend to validate challenge attempt
} else {
  // Challenge not completed e.g. user cancelled
}
```
