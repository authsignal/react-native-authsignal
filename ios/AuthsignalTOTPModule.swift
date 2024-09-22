import Security
import Foundation
import Authsignal

@objc(AuthsignalTOTPModule)
class AuthsignalTOTPModule: NSObject {
  var authsignal: AuthsignalTOTP?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalTOTP(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }
  
  @objc func enroll(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal!.enroll()
      
      if (response.errorCode != nil) {
        reject("enrollError", response.errorCode, nil)
      } else if (response.error != nil) {
        reject("enrollError", response.error, nil)
      } else {
        let enrollResponse: [String: String?] = [
          "userAuthenticatorId": response.data!.userAuthenticatorId,
          "uri": response.data!.uri,
          "secret": response.data!.secret,
        ]

        resolve(enrollResponse)
      }
    }
  }

  @objc func verify(
    _ code: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    let codeStr = code as String
    
    Task.init {
      let response = await authsignal!.verify(code: codeStr)
      
      if (response.errorCode != nil) {
        reject("verifyError", response.errorCode, nil)
      } else if (response.error != nil) {
        reject("verifyError", response.error, nil)
      } else {
        let verifyResponse: [String: Any?] = [
          "isVerified": response.data!.isVerified,
          "token": response.data!.token,
          "failureReason": response.data!.failureReason,
        ]

        resolve(verifyResponse)
      }
    }
  }
}
