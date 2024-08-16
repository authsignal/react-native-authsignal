package com.authsignal.react;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.uimanager.ViewManager;

public class AuthsignalPackage implements ReactPackage {
    @Override
    public List<NativeModule> createNativeModules(ReactApplicationContext reactContext) {
        return Arrays.asList(
          new AuthsignalModule(reactContext),
          new AuthsignalEmailModule(reactContext),
          new AuthsignalPasskeyModule(reactContext),
          new AuthsignalPushModule(reactContext),
          new AuthsignalSMSModule(reactContext),
          new AuthsignalTOTPModule(reactContext)
        );
    }

    @Override
    public List<ViewManager> createViewManagers(ReactApplicationContext reactContext) {
        return Collections.emptyList();
    }
}
