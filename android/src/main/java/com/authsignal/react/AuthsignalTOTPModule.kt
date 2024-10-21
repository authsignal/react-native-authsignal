package com.authsignal.react

import android.util.Log
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

class AuthsignalTOTPModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
    reactContext
  ) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalTOTP? = null
  private val defaultError = "unexpected_error"

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalTOTPModule"
  }

  @ReactMethod
  fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    val currentActivity = reactContext.currentActivity

    if (currentActivity != null) {
      authsignal = AuthsignalTOTP(tenantID, baseURL)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun enroll(promise: Promise) {
    launch(promise) {
      val response = it.enroll()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val enrollResponse = response.data
        val map = Arguments.createMap()
        map.putString("userAuthenticatorId", enrollResponse!!.userAuthenticatorId)
        map.putString("uri", enrollResponse.uri)
        map.putString("secret", enrollResponse.secret)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun verify(code: String, promise: Promise) {
    launch(promise) {
      val response = it.verify(code)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

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

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalTOTP) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalTOTPModule is not initialized.")

        promise.resolve(null)
      }
    }
  }
}
