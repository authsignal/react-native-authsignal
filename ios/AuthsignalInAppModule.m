#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(AuthsignalInAppModule, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString)tenantID
                  withBaseURL:(NSString)baseURL
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getCredential:(NSString)username
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(addCredential:(NSString)token
                  withRequireUserAuthentication:(BOOL)requireUserAuthentication
                  withKeychainAccess:(NSString)keychainAccess
                  withUsername:(NSString)username
                  withPerformAttestation:(BOOL)performAttestation
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(removeCredential:(NSString)username
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(verify:(NSString)action
                  withUsername:(NSString)username
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(createPin:(NSString)pin
                  withUsername:(NSString)username
                  withToken:(NSString)token
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(verifyPin:(NSString)pin
                  withUsername:(NSString)username
                  withAction:(NSString)action
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(deletePin:(NSString)username
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(getAllPinUsernames:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

@end
