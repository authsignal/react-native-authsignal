import Security
import Foundation
import Authsignal

@objc(AuthsignalPasskeyModule)
class AuthsignalPasskeyModule: NSObject {
  var authsignal: AuthsignalPasskey?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(_ tenantID: NSString, withBaseURL baseURL: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
  
    self.authsignal = AuthsignalPasskey(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }
  
  @objc func signUp(_ token: NSString, withUserName userName: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let tokenStr = token as String
    let userNameStr = userName as String?
    
    Task.init {
      let response = await authsignal?.signUp(token: tokenStr, userName: userNameStr)
      
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response.data)
      }
    }
  }
  
  @objc func signIn(_ token: NSString?, withAutofill autofill: Bool, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let tokenStr = token as String?
    
    Task.init {
      let response = await authsignal?.signIn(token: tokenStr, autofill: autofill)
      
      if (response.error) {
        reject(response.error)
      } else {
        resolve(response.data)
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
}
