package com.authsignal.react

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class AuthsignalPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf<NativeModule>(
      AuthsignalModule(reactContext),
      AuthsignalEmailModule(reactContext),
      AuthsignalPasskeyModule(reactContext),
      AuthsignalPushModule(reactContext),
      AuthsignalDeviceModule(reactContext),
      AuthsignalSMSModule(reactContext),
      AuthsignalTOTPModule(reactContext),
      AuthsignalWhatsappModule(reactContext)
    )
  }

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
    return emptyList()
  }
}
