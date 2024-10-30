package com.authsignal.react

import android.util.Log
import com.authsignal.passkey.AuthsignalPasskey
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class AuthsignalPasskeyModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalPasskey? = null
  private var defaultError = "unexpected_error"

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalPasskeyModule"
  }

  @ReactMethod
  fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    val activity = reactContext.currentActivity

    if (activity != null) {
      authsignal = AuthsignalPasskey(tenantID, baseURL, activity)
    }

    promise.resolve(null)
  }

  @ReactMethod
  fun signUp(token: String?, username: String?, displayName: String?, promise: Promise) {
    launch(promise) {
      val response = it.signUp(token, username, displayName)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val signUpResponse = response.data
        val map = Arguments.createMap()
        map.putString("token", signUpResponse!!.token)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun signIn(action: String?, token: String?, preferImmediatelyAvailableCredentials: Boolean, promise: Promise) {
    launch(promise) {
      val response = it.signIn(action, token, preferImmediatelyAvailableCredentials)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val signInResponse = response.data
        val map = Arguments.createMap()
        map.putBoolean("isVerified", signInResponse!!.isVerified)
        map.putString("token", signInResponse.token)
        map.putString("userId", signInResponse.userId)
        map.putString("userAuthenticatorId", signInResponse.userAuthenticatorId)
        map.putString("username", signInResponse.username)
        map.putString("displayName", signInResponse.displayName)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun isAvailableOnDevice(promise: Promise) {
    launch(promise) {
      val response = it.isAvailableOnDevice()

      promise.resolve(response.data ?: false)
    }
  }

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalPasskey) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalPasskeyModule is not initialized.")

        promise.resolve(null)
      }
    }
  }
}
