#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(AuthsignalPasskeyModule, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString)tenantID
                  withBaseURL:(NSString)baseURL
                  withDeviceID:(NSString)deviceID
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(signUp:(NSString)token
                  withUsername:(NSString)username
                  withDisplayName:(NSString)displayName
                  withIgnorePasskeyAlreadyExistsError:(BOOL)ignorePasskeyAlreadyExistsError
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(signIn:(NSString)action
                  withToken:(NSString)token
                  withAutofill:(BOOL)autofill
                  withPreferImmediatelyAvailableCredentials:(BOOL)preferImmediatelyAvailableCredentials
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(shouldPromptToCreatePasskey:(NSString)username
                  resolve:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isAvailableOnDevice:(RCTPromiseResolveBlock)resolve
                  reject:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(cancel)

@end
