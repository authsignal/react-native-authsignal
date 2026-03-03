package com.authsignal.react

import android.util.Log
import com.authsignal.passkey.AuthsignalPasskey
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@ReactModule(name = AuthsignalPasskeyModule.NAME)
class AuthsignalPasskeyModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalPasskeyModuleSpec(reactContext) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalPasskey? = null
  private var defaultError = "unexpected_error"

  @ReactMethod
  override fun initialize(tenantID: String, baseURL: String, deviceID: String?, promise: Promise) {
    val activity = reactContext.currentActivity

    if (activity != null) {
      authsignal = AuthsignalPasskey(tenantID, baseURL, activity, deviceID)
    }

    promise.resolve(null)
  }

  @ReactMethod
  override fun signUp(token: String?, username: String?, displayName: String?, ignorePasskeyAlreadyExistsError: Boolean, promise: Promise) {
    launch(promise) {
      val response = it.signUp(token, username, displayName, false, ignorePasskeyAlreadyExistsError)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else if (response.data != null) {
        val signUpResponse = response.data
        val map = Arguments.createMap()
        map.putString("token", signUpResponse!!.token)
        promise.resolve(map)
      } else {
        val map = Arguments.createMap()
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  override fun signIn(
    action: String?,
    token: String?,
    _autofill: Boolean,
    preferImmediatelyAvailableCredentials: Boolean,
    promise: Promise
  ) {
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
  override fun cancel() {
    // No-op on Android; cancel is only applicable for iOS autofill
  }

  @ReactMethod
  override fun shouldPromptToCreatePasskey(username: String?, promise: Promise) {
    launch(promise) {
      val response = it.shouldPromptToCreatePasskey(username)

      promise.resolve(response.data ?: false)
    }
  }

  @ReactMethod
  override fun isAvailableOnDevice(promise: Promise) {
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

  companion object {
    const val NAME = "AuthsignalPasskeyModule"
  }
}
