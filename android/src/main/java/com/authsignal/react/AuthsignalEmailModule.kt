package com.authsignal.react

import android.util.Log
import com.authsignal.email.AuthsignalEmail
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@ReactModule(name = AuthsignalEmailModule.NAME)
class AuthsignalEmailModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalEmailModuleSpec(reactContext) {
  private var authsignal: AuthsignalEmail? = null

  private val defaultError = "unexpected_error"

  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)

  @ReactMethod
  override fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    val currentActivity = reactContext.currentActivity

    if (currentActivity != null) {
      authsignal = AuthsignalEmail(tenantID, baseURL)
    }

    promise.resolve(null)
  }

  @ReactMethod
  override fun enroll(email: String, promise: Promise) {
    launch(promise) {
      val response = it.enroll(email)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

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
  override fun challenge(promise: Promise) {
    launch(promise) {
      val response = it.challenge()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

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
  override fun verify(code: String, promise: Promise) {
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

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalEmail) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalEmailModule is not initialized.")

        promise.resolve(null)
      }
    }
  }

  companion object {
    const val NAME = "AuthsignalEmailModule"
  }
}
