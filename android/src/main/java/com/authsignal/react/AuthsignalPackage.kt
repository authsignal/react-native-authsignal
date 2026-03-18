package com.authsignal.react

import com.facebook.react.TurboReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class AuthsignalPackage : TurboReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return when (name) {
      AuthsignalModule.NAME -> AuthsignalModule(reactContext)
      AuthsignalEmailModule.NAME -> AuthsignalEmailModule(reactContext)
      AuthsignalPasskeyModule.NAME -> AuthsignalPasskeyModule(reactContext)
      AuthsignalPushModule.NAME -> AuthsignalPushModule(reactContext)
      AuthsignalInAppModule.NAME -> AuthsignalInAppModule(reactContext)
      AuthsignalQRCodeModule.NAME -> AuthsignalQRCodeModule(reactContext)
      AuthsignalSMSModule.NAME -> AuthsignalSMSModule(reactContext)
      AuthsignalTOTPModule.NAME -> AuthsignalTOTPModule(reactContext)
      AuthsignalWhatsappModule.NAME -> AuthsignalWhatsappModule(reactContext)
      else -> null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    return ReactModuleInfoProvider {
      mapOf(
        AuthsignalModule.NAME to createModuleInfo(
          AuthsignalModule.NAME,
          AuthsignalModule::class.java.name
        ),
        AuthsignalEmailModule.NAME to createModuleInfo(
          AuthsignalEmailModule.NAME,
          AuthsignalEmailModule::class.java.name
        ),
        AuthsignalPasskeyModule.NAME to createModuleInfo(
          AuthsignalPasskeyModule.NAME,
          AuthsignalPasskeyModule::class.java.name
        ),
        AuthsignalPushModule.NAME to createModuleInfo(
          AuthsignalPushModule.NAME,
          AuthsignalPushModule::class.java.name
        ),
        AuthsignalInAppModule.NAME to createModuleInfo(
          AuthsignalInAppModule.NAME,
          AuthsignalInAppModule::class.java.name
        ),
        AuthsignalQRCodeModule.NAME to createModuleInfo(
          AuthsignalQRCodeModule.NAME,
          AuthsignalQRCodeModule::class.java.name
        ),
        AuthsignalSMSModule.NAME to createModuleInfo(
          AuthsignalSMSModule.NAME,
          AuthsignalSMSModule::class.java.name
        ),
        AuthsignalTOTPModule.NAME to createModuleInfo(
          AuthsignalTOTPModule.NAME,
          AuthsignalTOTPModule::class.java.name
        ),
        AuthsignalWhatsappModule.NAME to createModuleInfo(
          AuthsignalWhatsappModule.NAME,
          AuthsignalWhatsappModule::class.java.name
        ),
      )
    }
  }

  private fun createModuleInfo(name: String, className: String): ReactModuleInfo {
    return ReactModuleInfo(
      name,
      className,
      false,
      false,
      false,
      false,
      true,
    )
  }
}
