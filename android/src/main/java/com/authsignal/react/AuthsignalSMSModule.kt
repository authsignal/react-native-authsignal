package com.authsignal.react

import android.util.Log
import com.authsignal.models.AuthsignalResponse
import com.authsignal.models.ChallengeResponse
import com.authsignal.models.EnrollResponse
import com.authsignal.models.VerifyResponse
import com.authsignal.sms.AuthsignalSMS
import com.authsignal.totp.AuthsignalTOTP
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.util.function.Consumer

class AuthsignalSMSModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
    reactContext
  ) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalSMS? = null
  private val defaultError = "unexpected_error"

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalSMSModule"
  }

  @ReactMethod
  fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    val currentActivity = reactContext.currentActivity

    if (currentActivity != null) {
      authsignal = AuthsignalSMS(tenantID, baseURL)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun enroll(phoneNumber: String, promise: Promise) {
    launch(promise) {
      val response = it.enroll(phoneNumber)

      if (response.error != null) {
        val errorCode = response.errorType ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val enrollResponse = response.data
        val map = Arguments.createMap()
        map.putString("userAuthenticatorId", enrollResponse!!.userAuthenticatorId)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun challenge(promise: Promise) {
    launch(promise) {
      val response = it.challenge()

      if (response.error != null) {
        val errorCode = response.errorType ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val challengeResponse = response.data
        val map = Arguments.createMap()
        map.putString("challengeId", challengeResponse!!.challengeId)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun verify(code: String, promise: Promise) {
    launch(promise) {
      val response = it.verify(code)

      if (response.error != null) {
        val errorCode = response.errorType ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val verifyResponse = response.data
        val map = Arguments.createMap()
        map.putBoolean("isVerified", verifyResponse!!.isVerified)
        map.putString("token", verifyResponse.token)
        map.putString("failureReason", verifyResponse.failureReason)
        promise.resolve(map)
      }
    }
  }

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalSMS) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalSMSModule is not initialized.")

        promise.resolve(null)
      }
    }
  }
}
