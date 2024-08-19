package com.authsignal.react;

import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.push.AuthsignalPush;
import com.authsignal.push.models.PushCredential;
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
    return "AuthsignalPushModule";
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
        .thenAcceptAsync((response) -> {
          if (response.getError() != null) {
            promise.reject("getCredential error", response.getError());
          } else {
            PushCredential credential = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("credentialID", credential.getCredentialID());
            map.putString("createdAt", credential.getCreatedAt());
            map.putString("lastAuthenticatedAt", credential.getLastAuthenticatedAt());
            promise.resolve(map);
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
        .thenAcceptAsync(response -> {
          if (response.getErrorType() != null && response.getErrorType().equals("TYPE_TOKEN_NOT_SET")) {
            promise.reject("tokenNotSetError", "TOKEN_NOT_SET");
          } else if (response.getError() != null) {
            promise.reject("addCredential error", response.getError());
          } else {
            promise.resolve(response.getData());
          }
        });
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
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("removeCredential error", response.getError());
          } else {
            promise.resolve(response.getData());
          }
        });
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
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("getChallenge error", response.getError());
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
  public void updateChallenge(
    String challengeId,
    Boolean approved,
    String verificationCode,
    Promise promise
  ) {
    if (authsignalPush != null) {
      authsignalPush
        .updateChallengeAsync(challengeId, approved, verificationCode)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("updateChallenge error", response.getError());
          } else {
            promise.resolve(response.getData());
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(false);
    }
  }
}
