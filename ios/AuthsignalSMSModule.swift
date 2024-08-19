import Security
import Foundation
import Authsignal

@objc(AuthsignalSMSModule)
class AuthsignalSMSModule: NSObject {
  var authsignal: AuthsignalSMS?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalSMS(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }
  
  @objc func enroll(
    _ phoneNumber: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
      return
    }
    
    let phoneNumberStr = phoneNumber as String
    
    Task.init {
      let response = await authsignal!.enroll(phoneNumber: phoneNumberStr)
      
      if (response.errorCode == "TOKEN_NOT_SET") {
        reject("tokenNotSetError", "TOKEN_NOT_SET", nil)
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
      
      if (response.errorCode == "TOKEN_NOT_SET") {
        reject("tokenNotSetError", "TOKEN_NOT_SET", nil)
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
      
      if (response.errorCode == "TOKEN_NOT_SET") {
        reject("tokenNotSetError", "TOKEN_NOT_SET", nil)
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
