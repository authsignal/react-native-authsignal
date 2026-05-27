import Authsignal
import Foundation

private let authsignalReactNativeVersion = "2.12.1"

enum RequestMetadata {
  static func configure() {
    AuthsignalRequestMetadata.setWrapperSDK(
      "react-native",
      version: authsignalReactNativeVersion,
      userAgentToken: "AuthsignalReactNativeSDK"
    )
  }
}
