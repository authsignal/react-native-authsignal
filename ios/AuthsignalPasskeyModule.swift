import Security
import Foundation
import Authsignal

@objc(AuthsignalPasskeyModule)
class AuthsignalPasskeyModule: NSObject {
  var authsignal: AuthsignalPasskey?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalPasskey(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }
  
  @objc func signUp(
    _ token: NSString?,
    withUsername username: NSString?,
    withDisplayName displayName: NSString?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    let tokenStr = token as String?
    let usernameStr = username as String?
    let displayNameStr = displayName as String?
    
    Task.init {
      let response = await authsignal!.signUp(token: tokenStr, username: usernameStr, displayName: displayNameStr)
      
      if (response.error != nil) {
        reject(response.errorCode ?? "sign_up_error", response.error, nil)
      } else {
        let signUpResponse: [String: String?] = [
          "token": response.data!.token,
        ]

        resolve(signUpResponse)
      }
    }
  }
  
  @objc func signIn(
    _ action: NSString?,
    withToken token: NSString?,
    withAutofill autofill: Bool,
    withPreferImmediatelyAvailableCredentials preferImmediatelyAvailableCredentials: Bool,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    let actionStr = action as String?
    let tokenStr = token as String?
    
    Task.init {
      let response = await authsignal!.signIn(
        token: tokenStr,
        action: actionStr,
        autofill: autofill,
        preferImmediatelyAvailableCredentials: preferImmediatelyAvailableCredentials
      )
      
      if (response.error != nil) {
        reject(response.errorCode ?? "sign_in_error", response.error, nil)
      } else {
        let signInResponse: [String: Any?] = [
          "isVerified": response.data!.isVerified,
          "token": response.data!.token,
          "userId": response.data!.userId,
          "userAuthenticatorId": response.data!.userAuthenticatorId,
          "username": response.data!.username,
          "displayName": response.data!.displayName,
        ]

        resolve(signInResponse)
      }
    }
  }
  
  @objc func cancel() -> NSString? {
    authsignal?.cancel()
    
    return nil
  }
  
  @objc func invalidate() -> Void {
    authsignal?.cancel()
  }

  @objc func isAvailableOnDevice(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    if (authsignal == nil) {
      resolve(false)
      return
    }
    
    Task.init {
      let response = await authsignal!.isAvailableOnDevice()
      
      if (response.error != nil) {
        resolve(false)
      } else {
        resolve(response.data)
      }
    }
  }
}
