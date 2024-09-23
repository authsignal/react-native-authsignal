package com.authsignal.react;

import android.app.Activity;
import android.util.Log;

import androidx.annotation.NonNull;

import com.authsignal.sms.AuthsignalSMS;
import com.authsignal.models.*;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;

import java.util.HashMap;
import java.util.Map;

public class AuthsignalSMSModule extends ReactContextBaseJavaModule {
  private final ReactApplicationContext reactContext;

  private AuthsignalSMS authsignalSMS;

  private final String TAG = "AuthsignalSMSModule";
  private final String INIT_WARNING = "AuthsignalSMSModule is not initialized.";

  public AuthsignalSMSModule(ReactApplicationContext reactContext) {
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
    return "AuthsignalSMSModule";
  }

  @ReactMethod
  public void initialize(String tenantID, String baseURL, Promise promise) {
    Activity currentActivity = reactContext.getCurrentActivity();

    if (currentActivity != null) {
      authsignalSMS = new AuthsignalSMS(
        tenantID,
        baseURL
      );
    }

    promise.resolve(null);
  }

  @ReactMethod
  public void enroll(String phoneNumber, Promise promise) {
    if (authsignalSMS != null) {
      authsignalSMS
        .enrollAsync(phoneNumber)
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "enroll_error";

            promise.reject(errorCode, response.getError());
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
    if (authsignalSMS != null) {
      authsignalSMS
        .challengeAsync()
        .thenAcceptAsync(response -> {
          if (response.getError() != null) {
            String errorCode = response.getErrorType() != null ?
              response.getErrorType() :
              "challenge_error";

            promise.reject(errorCode, response.getError());
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
    if (authsignalSMS != null) {
      authsignalSMS
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
