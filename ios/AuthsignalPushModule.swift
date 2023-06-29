import Security
import Foundation
import Authsignal

@objc(AuthsignalPushModule)
class AuthsignalPushModule: NSObject {
  var authsignal: AuthsignalPush?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(_ tenantID: NSString, withBaseURL baseURL: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
  
    self.authsignal = AuthsignalPush(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }

  @objc func getCredential(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    Task.init {
      let credential = await authsignal?.getCredential()
            
      if let credential = credential {
        let data: [String: String?] = [
          "credentialID": credential.credentialID,
          "createdAt": credential.createdAt,
          "lastAuthenticatedAt": credential.lastAuthenticatedAt,
        ]
        
        resolve(data)
      } else {
        resolve(nil)
      }
    }
  }

  @objc func addCredential(_ token: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let tokenStr = token as String

    Task.init {
      let success = await authsignal?.addCredential(token: tokenStr)
      
      resolve(success)
    }
  }
  
  @objc func removeCredential(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    Task.init {
      let success = await authsignal?.removeCredential()
      
      resolve(success)
    }
  }

  @objc func getChallenge(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    Task.init {
      let challengeId = await authsignal?.getChallenge()
      
      resolve(challengeId)
    }
  }

  @objc func updateChallenge(_ challengeID: NSString, withApproval approved: Bool, withVerificationCode verificationCode: NSString, resolver resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {
    let challenge = challengeID as String
    let approval = approved as Bool
    let code = verificationCode as String?
    
    Task.init {
      await authsignal?.updateChallenge(challengeID: challenge, approved: approval, verificationCode: code)
      
      resolve(nil)
    }
  }
}
