import Authsignal
import Foundation
import React
import Security

@objc(AuthsignalPushModule)
class AuthsignalPushModule: NSObject {
  var authsignal: AuthsignalPush?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    RequestMetadata.configure()
    self.authsignal = AuthsignalPush(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }

  @objc func getCredential(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
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
    withKeychainAccess keychainAccess: NSString?,
    withPerformAttestation performAttestation: Bool,
    withPushToken pushToken: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let tokenStr = token as String?
    let requireAuthentication = requireUserAuthentication as Bool
    let keychainAccess = getKeychainAccess(value: keychainAccess as String?)
    let pushTokenStr = pushToken as String?

    Task.init {
      let response = await authsignal.addCredential(
        token: tokenStr,
        keychainAccess: keychainAccess,
        userPresenceRequired: requireAuthentication,
        performAttestation: performAttestation,
        pushToken: pushTokenStr
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
    reject: @escaping RCTPromiseRejectBlock
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
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.getChallenge()
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data as? AppChallenge {
        let challenge: [String: Any?] = [
          "challengeId": data.challengeId,
          "actionCode": data.actionCode,
          "idempotencyKey": data.idempotencyKey,
          "userAgent": data.userAgent,
          "deviceId": data.deviceId,
          "ipAddress": data.ipAddress,
          "custom": data.custom?.mapValues { $0.value },
          "user": data.user.map { user in ["custom": user.custom?.mapValues { $0.value }] },
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
    withVerificationCode verificationCode: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
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
  
  @objc func updateCredential(
    _ pushToken: NSString,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    Task.init {
      let response = await authsignal.updateCredential(pushToken: pushToken as String)

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
