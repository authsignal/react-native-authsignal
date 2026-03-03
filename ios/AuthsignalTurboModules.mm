#import <AuthsignalReactNativeSpec/AuthsignalReactNativeSpec.h>

#define AUTHSIGNAL_TURBO_MODULE(CLASS_NAME, PROTOCOL_NAME, JSI_CLASS)                                \
  @interface CLASS_NAME : NSObject                                                                    \
  @end                                                                                                 \
  @interface CLASS_NAME (TurboModule) <PROTOCOL_NAME>                                                 \
  @end                                                                                                 \
  @implementation CLASS_NAME (TurboModule)                                                            \
  - (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:                                    \
      (const facebook::react::ObjCTurboModule::InitParams &)params                                    \
  {                                                                                                    \
    return std::make_shared<facebook::react::JSI_CLASS>(params);                                      \
  }                                                                                                    \
  @end

AUTHSIGNAL_TURBO_MODULE(AuthsignalModule, NativeAuthsignalModuleSpec, NativeAuthsignalModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalEmailModule, NativeAuthsignalEmailModuleSpec, NativeAuthsignalEmailModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalPasskeyModule, NativeAuthsignalPasskeyModuleSpec, NativeAuthsignalPasskeyModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalPushModule, NativeAuthsignalPushModuleSpec, NativeAuthsignalPushModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalInAppModule, NativeAuthsignalInAppModuleSpec, NativeAuthsignalInAppModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalQRCodeModule, NativeAuthsignalQRCodeModuleSpec, NativeAuthsignalQRCodeModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalSMSModule, NativeAuthsignalSMSModuleSpec, NativeAuthsignalSMSModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalTOTPModule, NativeAuthsignalTOTPModuleSpec, NativeAuthsignalTOTPModuleSpecJSI)
AUTHSIGNAL_TURBO_MODULE(AuthsignalWhatsappModule, NativeAuthsignalWhatsappModuleSpec, NativeAuthsignalWhatsappModuleSpecJSI)

#undef AUTHSIGNAL_TURBO_MODULE
