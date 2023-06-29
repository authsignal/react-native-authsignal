package com.authsignal.react;

import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.push.AuthsignalPush;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class AuthsignalPushModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  private AuthsignalPush authsignalPush;

  private final String TAG = "AuthsignalPasskeyModule";
  private final String INIT_WARNING = "AuthsignalPasskeyModule is not initialized.";

  public AuthsignalPushModule(ReactApplicationContext reactContext) {
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
    return "AuthsignalPush";
  }

  @ReactMethod
  public void initialize(String tenantID, String baseURL, Promise promise) {
    authsignalPush = new AuthsignalPush(tenantID, baseURL);

    promise.resolve(null);
  }

  @ReactMethod
  public void getCredential(Promise promise) {
    if (authsignalPush != null) {
      authsignalPush
        .getCredentialAsync()
        .thenAcceptAsync((credential) -> {
          if (credential != null) {
            WritableMap map = Arguments.createMap();
            map.putString("credentialID", credential.getCredentialID());
            map.putString("createdAt", credential.getCreatedAt());
            map.putString("lastAuthenticatedAt", credential.getLastAuthenticatedAt());
            promise.resolve(map);
          } else {
            promise.resolve(null);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void addCredential(String token, Promise promise) {
    if (authsignalPush != null) {
      authsignalPush
        .addCredentialAsync(token, null)
        .thenAcceptAsync(promise::resolve);
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(false);
    }
  }

  @ReactMethod
  public void removeCredential(Promise promise) {
    if (authsignalPush != null) {
      authsignalPush
        .removeCredentialAsync()
        .thenAcceptAsync(promise::resolve);
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(false);
    }
  }

  @ReactMethod
  public void getChallenge(Promise promise) {
    if (authsignalPush != null) {
      authsignalPush
        .getChallengeAsync()
        .thenAcceptAsync(promise::resolve);
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void updateChallenge(
    String challengeId,
    Boolean approved,
    String verificationCode,
    Promise promise
  ) {
    if (authsignalPush != null) {
      authsignalPush
        .updateChallengeAsync(challengeId, approved, verificationCode)
        .thenAcceptAsync(promise::resolve);
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(false);
    }
  }
}
