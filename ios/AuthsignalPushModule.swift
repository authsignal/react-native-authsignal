import Security
import Foundation
import Authsignal

@objc(AuthsignalPushModule)
class AuthsignalPushModule: NSObject {
  var authsignal: AuthsignalPush?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalPush(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }

  @objc func getCredential(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
    }
    
    Task.init {
      let response = await authsignal.getCredential()
            
      if (response.error != nil) {
        reject(response.error)
      } else if (response.data != nil) {
        let data: [String: String?] = [
          "credentialID": response.data.credentialID,
          "createdAt": response.data.createdAt,
          "lastAuthenticatedAt": response.data.lastAuthenticatedAt,
        ]
        
        resolve(data)
      } else {
        resolve(nil)
      }
    }
  }

  @objc func addCredential(
    _ token: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
    }
    
    let tokenStr = token as String
    
    Task.init {
      let response = await authsignal.addCredential(token: tokenStr)
      
      if (response.error != nil) {
        reject(response.error)
      } else {
        resolve(response.data)
      }
    }
  }
  
  @objc func removeCredential(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
    }
    
    Task.init {
      let response = await authsignal.removeCredential()
      
      if (response.error != nil) {
        reject(response.error)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func getChallenge(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
    }
    
    Task.init {
      let response = await authsignal.getChallenge()
      
      if (response.error != nil) {
        reject(response.error)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func updateChallenge(
    _ challengeID: NSString,
    withApproval approved: Bool,
    withVerificationCode verificationCode: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    if (authsignal == nil) {
      resolve(nil)
    }
    
    let challenge = challengeID as String
    let approval = approved as Bool
    let code = verificationCode as String?
    
    Task.init {
      let response = await authsignal.updateChallenge(challengeID: challenge, approved: approval, verificationCode: code)
      
      if (response.error != nil) {
        reject(response.error)
      } else {
        resolve(response.data)
      }
    }
  }
}
