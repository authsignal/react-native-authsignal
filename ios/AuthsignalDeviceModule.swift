import Security
import Foundation
import Authsignal

@objc(AuthsignalDeviceModule)
class AuthsignalDeviceModule: NSObject {
  var authsignal: AuthsignalDevice?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalDevice(tenantID: tenantID as String, baseURL: baseURL as String)
    
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
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data {
        let credential: [String: String?] = [
          "credentialId": data.credentialId,
          "createdAt": data.createdAt,
          "userId": data.userId,
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
    withRequireUserAuthentication requireUserAuthentication: Bool,
    withKeychainAccess keychainAccess: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let tokenStr = token as String?
    let userPresenceRequired = requireUserAuthentication as Bool
    let keychainAccess = getKeychainAccess(value: keychainAccess as String?)
    
    Task.init {
      let response = await authsignal.addCredential(
        token: tokenStr,
        keychainAccess: keychainAccess,
        userPresenceRequired: userPresenceRequired
      )
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data {
        let credential: [String: String?] = [
          "credentialId": data.credentialId,
          "createdAt": data.createdAt,
          "userId": data.userId,
          "lastAuthenticatedAt": data.lastAuthenticatedAt,
        ]
        
        resolve(credential)
      } else {
        resolve(nil)
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
        reject(response.errorCode ?? "unexpected_error", error, nil)
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
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data as? DeviceChallenge {
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

  @objc func claimChallenge(
    _ challengeId: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let challenge = challengeId as String
    
    Task.init {
      let response = await authsignal.claimChallenge(challengeId: challenge)
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data {
        let result: [String: Any?] = [
          "success": data.success,
          "userAgent": data.userAgent,
          "ipAddress": data.ipAddress,
        ]
        
        resolve(result)
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
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func verify(
    _ resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.verify()
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data {
        let result: [String: String?] = [
          "token": data.token,
          "userId": data.userId,
          "userAuthenticatorId": data.userAuthenticatorId,
          "username": data.username,
        ]
        
        resolve(result)
      } else {
        resolve(nil)
      }
    }
  }

  func getKeychainAccess(value: String?) -> KeychainAccess {
    switch value {
    case "afterFirstUnlock":
      return .afterFirstUnlock
      
    case "afterFirstUnlockThisDeviceOnly":
      return .afterFirstUnlockThisDeviceOnly
        
    case "whenUnlocked":
      return .whenUnlocked
        
    case "whenUnlockedThisDeviceOnly":
      return .whenUnlockedThisDeviceOnly
        
    case "whenPasscodeSetThisDeviceOnly":
      return .whenPasscodeSetThisDeviceOnly
      
    default:
      return .whenUnlockedThisDeviceOnly
    }
  }
}
