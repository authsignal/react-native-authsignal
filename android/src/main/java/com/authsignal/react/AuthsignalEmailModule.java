package com.authsignal.react;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.email.AuthsignalEmail;
import com.authsignal.models.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class AuthsignalEmailModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  private AuthsignalEmail authsignalEmail;

  private final String TAG = "AuthsignalEmailModule";
  private final String INIT_WARNING = "AuthsignalEmailModule is not initialized.";

  public AuthsignalEmailModule(ReactApplicationContext reactContext) {
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
    return "AuthsignalEmailModule";
  }

  @ReactMethod
  public void initialize(String tenantID, String baseURL, Promise promise) {
    Activity currentActivity = reactContext.getCurrentActivity();

    if (currentActivity != null) {
      authsignalEmail = new AuthsignalEmail(
        tenantID,
        baseURL
      );
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void enroll(String email, Promise promise) {
    if (authsignalEmail != null) {
      authsignalEmail
        .enrollAsync(email)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("enroll error", response.getError());
          } else {
            EnrollResponse enrollResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("userAuthenticatorId", enrollResponse.getUserAuthenticatorId());
            promise.resolve(map);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void challenge(Promise promise) {
    if (authsignalEmail != null) {
      authsignalEmail
        .challengeAsync()
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("challenge error", response.getError());
          } else {
            ChallengeResponse challengeResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("challengeId", challengeResponse.getChallengeId());
            promise.resolve(map);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }

  @ReactMethod
  public void verify(String code, Promise promise) {
    if (authsignalEmail != null) {
      authsignalEmail
        .verifyAsync(code)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            promise.reject("verify error", response.getError());
          } else {
            VerifyResponse verifyResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putBoolean("isVerified", verifyResponse.isVerified());
            map.putString("accessToken", verifyResponse.getAccessToken());
            map.putString("failureReason", verifyResponse.getFailureReason());
            promise.resolve(map);
          }
        });
    } else {
      Log.w(TAG, INIT_WARNING);

      promise.resolve(null);
    }
  }
}