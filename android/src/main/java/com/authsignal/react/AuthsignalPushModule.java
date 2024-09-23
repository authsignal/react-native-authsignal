package com.authsignal.react;

import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.push.AuthsignalPush;
import com.authsignal.push.models.PushChallenge;
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
            promise.reject("get_credential_error", response.getError());
          } else {
            PushCredential credential = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("credentialId", credential.getCredentialId());
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
  public void addCredential(
    String token,
    Promise promise) {
    if (authsignalPush != null) {
      authsignalPush
        .addCredentialAsync(token, null)
        .thenAcceptAsync(response -> {
          String errorCode = response.getErrorType() != null ?
            response.getErrorType() :
            "add_credential_error";

          if (response.getError() != null) {
            promise.reject(errorCode, response.getError());
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
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "remove_credential_error";

            promise.reject(errorCode, response.getError());
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
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "get_challenge_error";

            promise.reject(errorCode, response.getError());
          } else {
            PushChallenge challenge = response.getData();

            if (challenge == null) {
              promise.resolve(null);
            } else {
              WritableMap map = Arguments.createMap();
              map.putString("challengeId", challenge.getChallengeId());
              map.putString("actionCode", challenge.getActionCode());
              map.putString("idempotencyKey", challenge.getIdempotencyKey());
              map.putString("ipAddress", challenge.getIpAddress());
              map.putString("deviceId", challenge.getDeviceId());
              map.putString("userAgent", challenge.getUserAgent());
              promise.resolve(map);
            }
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
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "update_challenge_error";

            promise.reject(errorCode, response.getError());
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
