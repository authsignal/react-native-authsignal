package com.authsignal.react

import android.util.Log
import com.authsignal.whatsapp.AuthsignalWhatsApp
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
@ReactModule(name = AuthsignalWhatsappModule.NAME)
class AuthsignalWhatsappModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalWhatsappModuleSpec(reactContext) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalWhatsApp? = null
  private val defaultError = "unexpected_error"

  @ReactMethod
  override fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    val currentActivity = reactContext.currentActivity

    if (currentActivity != null) {
      authsignal = AuthsignalWhatsApp(tenantID, baseURL)
    }

    promise.resolve(null)
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

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalWhatsApp) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalWhatsappModule is not initialized.")

        promise.resolve(null)
      }
    }
  }

  companion object {
    const val NAME = "AuthsignalWhatsappModule"
  }
}
