#import "AuthsignalModule.h"
#import <React/RCTConvert.h>

@interface AuthsignalModule ()
@property (strong, nonatomic) NSObject *session;
@end

@implementation AuthsignalModule

RCT_EXPORT_MODULE();

- (dispatch_queue_t)methodQueue
{
  return dispatch_get_main_queue();
}

RCT_EXPORT_METHOD(launch:(NSString *)url resolver:(RCTPromiseResolveBlock)resolve rejecter:(RCTPromiseRejectBlock)reject)
{
  NSURL *authUrl = [RCTConvert NSURL:url];
  NSString *scheme = @"authsignal";
  
  ASWebAuthenticationSession* authenticationSession = [[ASWebAuthenticationSession alloc] initWithURL:authUrl
                                                                                    callbackURLScheme:scheme
                                                                                    completionHandler:^(NSURL * _Nullable callbackURL,
                                                                                                        NSError * _Nullable error) {
    if (callbackURL) {
      NSURLComponents *components = [[NSURLComponents alloc] initWithString:callbackURL.absoluteString];
      NSString *token;
      
      for (NSURLQueryItem *item in components.queryItems) {
        if ([item.name isEqualToString:@"token"]) {
          token = item.value;
        }
      }
      
      resolve(token);
    } else if (error) {
      if ([[error domain] isEqualToString:ASWebAuthenticationSessionErrorDomain] &&
          [error code] == ASWebAuthenticationSessionErrorCodeCanceledLogin) {
        resolve(nil);
      } else {
        reject(@"AS_ERROR", error.description, nil);
      }
    }
    
    self.session = nil;
  }];

  #if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
  if (@available(iOS 13, *)) {
    authenticationSession.presentationContextProvider = self;
    authenticationSession.prefersEphemeralWebBrowserSession = NO;
  }
  #endif
  
  self.session = authenticationSession;
  
  [(ASWebAuthenticationSession*) self.session start];
}

#if __IPHONE_OS_VERSION_MAX_ALLOWED >= 130000
- (ASPresentationAnchor)presentationAnchorForWebAuthenticationSession:(ASWebAuthenticationSession *)session  API_AVAILABLE(ios(13.0)){
   return UIApplication.sharedApplication.keyWindow;
}
#endif

@end

