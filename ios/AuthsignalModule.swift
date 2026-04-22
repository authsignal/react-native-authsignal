import AuthenticationServices
import Authsignal
import Foundation
import React
import Security

@objc(AuthsignalModule)
class AuthsignalModule: NSObject, ASWebAuthenticationPresentationContextProviding {
  private let callbackScheme = "authsignal"
  private let nativeSchemeQueryItemName = "nativeScheme"
  var session: ASWebAuthenticationSession?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func methodQueue() -> DispatchQueue {
      return DispatchQueue.main
  }
  
  @objc func launch(
    _ url: NSString,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authUrl = buildLaunchURL(from: url as String) else {
      reject("launchError", "Invalid URL", nil)
      
      return
    }
    
    let authenticationSession = ASWebAuthenticationSession(url: authUrl, callbackURLScheme: callbackScheme) { callbackURL, error in
      if let error {
        if self.isCanceledLoginError(error) {
          resolve(nil)
        } else {
          reject("launchError", error.localizedDescription, nil)
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
    _ token: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    TokenCache.shared.token = token as String?

    resolve("token_set")
  }

  @objc func getDeviceId(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    Task {
      let deviceId = await DeviceCache.shared.getDefaultDeviceID()
      resolve(deviceId)
    }
  }
  
  private func isCanceledLoginError(_ error: Error) -> Bool {
    (error as NSError).code == ASWebAuthenticationSessionError.canceledLogin.rawValue
  }

  private func buildLaunchURL(from urlString: String) -> URL? {
    guard let authUrl = URL(string: urlString),
      var components = URLComponents(url: authUrl, resolvingAgainstBaseURL: false) else {
      return nil
    }

    var queryItems = components.queryItems?.filter { $0.name != nativeSchemeQueryItemName } ?? []
    queryItems.append(URLQueryItem(name: nativeSchemeQueryItemName, value: callbackScheme))
    components.queryItems = queryItems

    return components.url
  }
  
  func presentationAnchor(for session: ASWebAuthenticationSession) -> ASPresentationAnchor {
    if let windowScene = UIApplication.shared.connectedScenes
      .first(where: { $0.activationState == .foregroundActive }) as? UIWindowScene,
      let keyWindow = windowScene.windows.first(where: { $0.isKeyWindow }) {
      return keyWindow
    }
    return UIWindow()
  }
}
