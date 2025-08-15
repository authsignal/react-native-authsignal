import Security
import Foundation
import Authsignal

@objc(AuthsignalWhatsappModule)
class AuthsignalWhatsappModule: NSObject {
  var authsignal: AuthsignalWhatsapp?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalWhatsapp(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
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
      
      if (response.error != nil) {
        reject(response.errorCode ?? "unexpected_error", response.error, nil)
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
      
      if (response.error != nil) {
        reject(response.errorCode ?? "unexpected_error", response.error, nil)
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
