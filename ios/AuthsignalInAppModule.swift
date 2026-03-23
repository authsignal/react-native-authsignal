import Authsignal
import Foundation
import React
import Security

@objc(AuthsignalInAppModule)
class AuthsignalInAppModule: NSObject {
  var authsignal: AuthsignalInApp?
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc func initialize(
    _ tenantID: NSString,
    withBaseURL baseURL: NSString,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    self.authsignal = AuthsignalInApp(tenantID: tenantID as String, baseURL: baseURL as String)
    
    resolve(nil)
  }

  @objc func getCredential(
    _ username: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let usernameStr = username as String?
    
    Task.init {
      let response = await authsignal.getCredential(username: usernameStr)
      
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
    withUsername username: NSString?,
    withDeviceIntegrity deviceIntegrity: Bool,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let tokenStr = token as String?
    let userPresenceRequired = requireUserAuthentication as Bool
    let keychainAccess = getKeychainAccess(value: keychainAccess as String?)
    let usernameStr = username as String?

    Task.init {
      let response = await authsignal.addCredential(
        token: tokenStr,
        keychainAccess: keychainAccess,
        userPresenceRequired: userPresenceRequired,
        username: usernameStr,
        deviceIntegrity: deviceIntegrity
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
    _ username: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let usernameStr = username as String?
    
    Task.init {
      let response = await authsignal.removeCredential(username: usernameStr)
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func verify(
    _ action: NSString?,
    withUsername username: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let actionStr = action as String?
    let usernameStr = username as String?
    
    Task.init {
      let response = await authsignal.verify(action: actionStr, username: usernameStr)
      
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
  
  @objc func createPin(
    _ pin: NSString,
    withUsername username: NSString,
    withToken token: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let pinStr = pin as String
    let usernameStr = username as String
    let tokenStr = token as String?
    
    Task.init {
      let response = await authsignal.createPin(
        pin: pinStr,
        username: usernameStr,
        token: tokenStr
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
  
  @objc func verifyPin(
    _ pin: NSString,
    withUsername username: NSString,
    withAction action: NSString?,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let pinStr = pin as String
    let usernameStr = username as String
    let actionStr = action as String?
    
    Task.init {
      let response = await authsignal.verifyPin(
        pin: pinStr,
        username: usernameStr,
        action: actionStr
      )
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else if let data = response.data {
        let verifyPinResponse: [String: Any?] = [
          "isVerified": data.isVerified,
          "token": data.token,
          "userId": data.userId,
        ]

        resolve(verifyPinResponse)
      } else {
        reject("unexpected_error", "No data returned", nil)
      }
    }
  }
  
  @objc func deletePin(
    _ username: NSString,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }

    let usernameStr = username as String
    
    Task.init {
      let response = await authsignal.deletePin(username: usernameStr)
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }

  @objc func getAllPinUsernames(
    _ resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    Task.init {
      let response = await authsignal.getAllPinUsernames()
      
      if let error = response.error {
        reject(response.errorCode ?? "unexpected_error", error, nil)
      } else {
        resolve(response.data)
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
