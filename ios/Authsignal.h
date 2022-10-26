#import <React/RCTBridgeModule.h>

@import AuthenticationServices;

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
@interface Authsignal : NSObject <RCTBridgeModule, ASWebAuthenticationPresentationContextProviding>
@end
#else
@interface Authsignal : NSObject <RCTBridgeModule>
@end
#endif

