import Security
import Foundation
import Authsignal

@objc(AuthsignalEmailModule)
class AuthsignalEmailModule: NSObject {
  var authsignal: AuthsignalEmail?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalEmail(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }
  
  @objc func enroll(
    _ email: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    let emailStr = email as String
    
    Task.init {
      let response = await authsignal!.enroll(email: emailStr)
      
      if (response.errorCode != nil) {
        reject("enrollError", response.errorCode, nil)
      } else if (response.error != nil) {
        reject("enrollError", response.error, nil)
      } else {
        let enrollResponse: [String: String?] = [
          "userAuthenticatorId": response.data!.userAuthenticatorId,
        ]

        resolve(enrollResponse)
      }
    }
  }

  @objc func challenge(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal!.challenge()
      
      if (response.errorCode != nil) {
        reject("challengeError", response.errorCode, nil)
      } else if (response.error != nil) {
        reject("challengeError", response.error, nil)
      } else {
        let challengeResponse: [String: String?] = [
          "challengeId": response.data!.challengeId,
        ]

        resolve(challengeResponse)
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
