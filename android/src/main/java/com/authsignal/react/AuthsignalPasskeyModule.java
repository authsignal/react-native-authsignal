package com.authsignal.react;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.passkey.AuthsignalPasskey;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import java.util.HashMap;
import java.util.Map;

public class AuthsignalPasskeyModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  private AuthsignalPasskey authsignalPasskey;

  private final String TAG = "AuthsignalPasskeyModule";
  private final String INIT_WARNING = "AuthsignalPasskeyModule is not initialized.";

  public AuthsignalPasskeyModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    constants.put("bundleIdentifier", reactContext.getApplicationInfo().packageName);
    return constants;
  }

  @NonNull
  @Override
  public String getName() {
    return "AuthsignalPasskeyModule";
  }

  @ReactMethod
  public void initialize(String tenantID, String baseURL, Promise promise) {
    Activity currentActivity = reactContext.getCurrentActivity();

    if (currentActivity != null) {
      authsignalPasskey = new AuthsignalPasskey(
        tenantID,
        baseURL,
        reactContext,
        reactContext.getCurrentActivity()
      );
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void signUp(String token, String userName, Promise promise) {
    if (authsignalPasskey != null) {
      authsignalPasskey
        .signUpAsync(token, userName)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("signUp error", response.getError());
          } else {
            promise.resolve(response.getData());
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void signIn(String token, Promise promise) {
    if (authsignalPasskey != null) {
      authsignalPasskey
        .signInAsync(token)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("signIn error", response.getError());
          } else {
            promise.resolve(response.getData());
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }
}
