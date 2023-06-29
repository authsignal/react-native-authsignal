#import <React/RCTBridgeModule.h>

@import AuthenticationServices;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
@interface AuthsignalModule : NSObject <RCTBridgeModule, ASWebAuthenticationPresentationContextProviding>
@end
#else
@interface AuthsignalModule : NSObject <RCTBridgeModule>
@end
#endif
