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
          "credentialID": response.data!.credentialID,
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
    _ token: NSString,
    resolver resolve: @escaping RCTPromiseResolveBlock,
    rejecter reject: @escaping RCTPromiseRejectBlock
  ) -> Void {
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let tokenStr = token as String
    
    Task.init {
      let response = await authsignal.addCredential(token: tokenStr)
      
      if let error = response.error {
        reject("addCredential error", error, nil)
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
        reject("removeCredential error", error, nil)
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
        reject("getChallenge error", error, nil)
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
    guard let authsignal = authsignal else {
      resolve(nil)
      return
    }
    
    let challenge = challengeID as String
    let approval = approved as Bool
    let code = verificationCode as String?
    
    Task.init {
      let response = await authsignal.updateChallenge(
        challengeID: challenge,
        approved: approval,
        verificationCode: code
      )
      
      if let error = response.error {
        reject("updateChallenge error", error, nil)
      } else {
        resolve(response.data)
      }
    }
  }
}
