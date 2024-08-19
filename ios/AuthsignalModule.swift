import AuthenticationServices
import Authsignal
import Foundation
import React
import Security

@objc(AuthsignalModule)
class AuthsignalModule: NSObject, ASWebAuthenticationPresentationContextProviding {
  var session: ASWebAuthenticationSession?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func launch(
    _ url: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    let authUrl = URL(string: url as String)!
    let scheme = "authsignal"

    let authenticationSession = ASWebAuthenticationSession(url: authUrl, callbackURLScheme: scheme) { callbackURL, error in
      if let error {
        if self.isCanceledLoginError(error) {
          resolve(nil)
        } else {
          reject("AS_ERROR", error.localizedDescription, nil)
        }
      } else if let callbackURL = callbackURL {
        let components = URLComponents(string: callbackURL.absoluteString)
        var token: String?

        for item in components?.queryItems ?? [] {
          if item.name == "token" {
            token = item.value

            TokenCache.shared.token = item.value
          }
        }

        resolve(token)
      }

      self.session = nil
    }

    #if os(iOS) && swift(>=5.1)
    if #available(iOS 13, *) {
        authenticationSession.presentationContextProvider = self
        authenticationSession.prefersEphemeralWebBrowserSession = false
    }
    #endif

    self.session = authenticationSession

    self.session?.start()
  }
  
  @objc func setToken(
    _ token: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    TokenCache.shared.token = token as String

    resolve("token_set")
  }
  
  private func isCanceledLoginError(_ error: Error) -> Bool {
    (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue
  }
  
  func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
    return UIApplication.shared.keyWindow!
  }
}
