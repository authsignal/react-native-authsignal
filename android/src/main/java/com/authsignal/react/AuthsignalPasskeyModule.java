package com.authsignal.react;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.passkey.AuthsignalPasskey;
import com.authsignal.passkey.models.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

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
  public void signUp(String token, String userName, String displayName, Promise promise) {
    if (authsignalPasskey != null) {
      authsignalPasskey
        .signUpAsync(token, userName, displayName)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("signUp error", response.getError());
          } else {
            SignUpResponse signUpResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("token", signUpResponse.getToken());
            promise.resolve(map);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void signIn(String action, String token, Promise promise) {
    if (authsignalPasskey != null) {
      authsignalPasskey
        .signInAsync(action, token)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("signIn error", response.getError());
          } else {
            SignInResponse signInResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putBoolean("isVerified", signInResponse.isVerified());
            map.putString("token", signInResponse.getToken());
            map.putString("userId", signInResponse.getUserId());
            map.putString("userAuthenticatorId", signInResponse.getUserAuthenticatorId());
            map.putString("userName", signInResponse.getUserName());
            map.putString("userDisplayName", signInResponse.getUserDisplayName());
            promise.resolve(map);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void isAvailableOnDevice(Promise promise) {
    if (authsignalPasskey != null) {
      authsignalPasskey
        .isAvailableOnDeviceAsync()
        .thenAcceptAsync(response -> {
          promise.resolve(response.getData() != null ? response.getData() : false);
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(false);
    }
  }
}
