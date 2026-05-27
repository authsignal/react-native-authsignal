package com.authsignal.react

import com.authsignal.AuthsignalRequestMetadata

internal object RequestMetadata {
  fun configure() {
    AuthsignalRequestMetadata.setWrapperSDK(
      sdk = "react-native",
      version = BuildConfig.VERSION_NAME,
      userAgentToken = "AuthsignalReactNativeSDK",
    )
  }
}
