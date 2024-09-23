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
          "credentialId": data.credentialId,
          "createdAt": data.createdAt,
          "lastAuthenticatedAt": data.lastAuthenticatedAt,
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
    let keychainAccess: KeychainAccess = .whenUnlockedThisDeviceOnly
    
    Task.init {
      let response = await authsignal.addCredential(token: tokenStr, keychainAccess: keychainAccess)
      
      if let error = response.error {
        reject(response.errorCode ?? "add_credential_error", error, nil)
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
        reject(response.errorCode ?? "remove_credential_error", error, nil)
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
        reject(response.errorCode ?? "get_challenge_error", error, nil)
      } else if let data = response.data as? PushChallenge {
        let challenge: [String: String?] = [
          "challengeId": data.challengeId,
          "actionCode": data.actionCode,
          "idempotencyKey": data.idempotencyKey,
          "userAgent": data.userAgent,
          "deviceId": data.deviceId,
          "ipAddress": data.ipAddress,
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
        reject(response.errorCode ?? "update_challenge_error", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }
}
