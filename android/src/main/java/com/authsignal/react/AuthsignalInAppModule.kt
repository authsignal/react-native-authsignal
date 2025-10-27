package com.authsignal.react

import android.util.Log
import com.authsignal.inapp.AuthsignalInApp
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class AuthsignalInAppModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
    reactContext
  ) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalInApp? = null
  private var defaultError = "unexpected_error"

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalInAppModule"
  }

  @ReactMethod
  fun initialize(tenantID: String?, baseURL: String?, promise: Promise) {
    Log.d("AuthsignalInAppModule", "initialize: $tenantID, $baseURL")
    authsignal = AuthsignalInApp(tenantID!!, baseURL!!)

    promise.resolve(null)
  }

  @ReactMethod
  fun getCredential(promise: Promise) {
    launch(promise) {
      val response = it.getCredential()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else if (response.data != null) {
        val credential = response.data
        val map = Arguments.createMap()
        map.putString("credentialId", credential!!.credentialId)
        map.putString("createdAt", credential.createdAt)
        map.putString("userId", credential.userId)
        map.putString("lastAuthenticatedAt", credential.lastAuthenticatedAt)
        promise.resolve(map)
      } else {
        promise.resolve(null)
      }
    }
  }

  @ReactMethod
  fun addCredential(
    token: String?,
    promise: Promise
  ) {
    launch(promise) {
      val response = it.addCredential(token, null)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val credential = response.data
        val map = Arguments.createMap()
        map.putString("credentialId", credential!!.credentialId)
        map.putString("createdAt", credential.createdAt)
        map.putString("userId", credential.userId)
        map.putString("lastAuthenticatedAt", credential.lastAuthenticatedAt)
        promise.resolve(map)
      }
    }
  }

  @ReactMethod
  fun removeCredential(promise: Promise) {
    launch(promise) {
      val response = it.removeCredential()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        promise.resolve(response.data)
      }
    }
  }

  @ReactMethod
  fun verify(promise: Promise) {
    launch(promise) {
      val response = it.verify()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val data = response.data!!
        val map = Arguments.createMap()
        map.putString("token", data.token)
        map.putString("userId", data.userId)
        map.putString("userAuthenticatorId", data.userAuthenticatorId)
        map.putString("username", data.username)
        promise.resolve(map)
      }
    }
  }

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalDevice) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalInAppModule is not initialized.")

        promise.resolve(null)
      }
    }
  }
}
