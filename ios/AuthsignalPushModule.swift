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
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.getCredential()
      
      if let error = response.error {
        reject("getCredential error", error, nil)
      } else if let data = response.data {
        let credential: [String: String?] = [
          "credentialId": response.data!.credentialId,
          "createdAt": response.data!.createdAt,
          "lastAuthenticatedAt": response.data!.lastAuthenticatedAt,
        ]
        
        resolve(credential)
      } else {
        resolve(nil)
      }
    }
  }

  @objc func addCredential(
    _ token: NSString?,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let tokenStr = token as String?
    
    Task.init {
      let response = await authsignal.addCredential(token: tokenStr)
      
      if (response.errorCode == "TOKEN_NOT_SET") {
        reject("tokenNotSetError", "TOKEN_NOT_SET", nil)
      } else if let error = response.error {
        reject("addCredentialError", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }
  
  @objc func removeCredential(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.removeCredential()
      
      if let error = response.error {
        reject("removeCredentialError", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func getChallenge(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.getChallenge()
      
      if let error = response.error {
        reject("getChallengeError", error, nil)
      } else if let data = response.data {
        let challenge: [String: String?] = [
          "challengeId": response.data!.challengeId,
          "actionCode": response.data!.actionCode,
          "idempotencyKey": response.data!.idempotencyKey,
          "userAgent": response.data!.userAgent,
          "deviceId": response.data!.deviceId,
          "ipAddress": response.data!.ipAddress,
        ]
        
        resolve(challenge)
      } else {
        resolve(nil)
      }
    }
  }

  @objc func updateChallenge(
    _ challengeId: NSString,
    withApproval approved: Bool,
    withVerificationCode verificationCode: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let challenge = challengeId as String
    let approval = approved as Bool
    let code = verificationCode as String?
    
    Task.init {
      let response = await authsignal.updateChallenge(
        challengeId: challenge,
        approved: approval,
        verificationCode: code
      )
      
      if let error = response.error {
        reject("updateChallengeError", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }
}
