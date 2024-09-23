package com.authsignal.react;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.totp.AuthsignalTOTP;
import com.authsignal.models.*;
import com.authsignal.totp.api.models.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class AuthsignalTOTPModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  private AuthsignalTOTP authsignalTOTP;

  private final String TAG = "AuthsignalTOTPModule";
  private final String INIT_WARNING = "AuthsignalTOTPModule is not initialized.";

  public AuthsignalTOTPModule(ReactApplicationContext reactContext) {
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
    return "AuthsignalTOTPModule";
  }

  @ReactMethod
  public void initialize(String tenantID, String baseURL, Promise promise) {
    Activity currentActivity = reactContext.getCurrentActivity();

    if (currentActivity != null) {
      authsignalTOTP = new AuthsignalTOTP(
        tenantID,
        baseURL
      );
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void enroll(Promise promise) {
    if (authsignalTOTP != null) {
      authsignalTOTP
        .enrollAsync()
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "enroll_error";

            promise.reject(errorCode, response.getError());
          } else {
            EnrollTOTPResponse enrollResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putString("userAuthenticatorId", enrollResponse.getUserAuthenticatorId());
            map.putString("uri", enrollResponse.getUri());
            map.putString("secret", enrollResponse.getSecret());
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
    if (authsignalTOTP != null) {
      authsignalTOTP
        .verifyAsync(code)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "verify_error";

            promise.reject(errorCode, response.getError());
          } else {
            VerifyResponse verifyResponse = response.getData();
            WritableMap map = Arguments.createMap();
            map.putBoolean("isVerified", verifyResponse.isVerified());
            map.putString("token", verifyResponse.getToken());
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
