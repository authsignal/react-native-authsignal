import Authsignal
import Foundation

private let authsignalReactNativeVersion = "3.2.0"

enum RequestMetadata {
  static func configure() {
    AuthsignalRequestMetadata.setWrapperSDK(
      "react-native",
      version: authsignalReactNativeVersion,
      userAgentToken: "AuthsignalReactNativeSDK"
    )
  }
}
