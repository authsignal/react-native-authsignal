#import <React/RCTBridgeModule.h>
#import <Foundation/Foundation.h>

@interface RCT_EXTERN_MODULE(AuthsignalPasskeyModule, NSObject)

RCT_EXTERN_METHOD(initialize:(NSString)tenantID
                  withBaseURL:(NSString)baseURL
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(signUp:(NSString)token
                  withUsername:(NSString)username
                  withDisplayName:(NSString)displayName
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(signIn:(NSString)action
                  withToken:(NSString)token
                  withAutofill:(BOOL)autofill
                  withPreferImmediatelyAvailableCredentials:(BOOL)preferImmediatelyAvailableCredentials
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(isAvailableOnDevice:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN__BLOCKING_SYNCHRONOUS_METHOD(cancel)

@end
