package com.authsignal.react

import android.util.Log
import com.authsignal.device.AuthsignalDevice
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

class AuthsignalDeviceModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
    reactContext
  ) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalDevice? = null
  private var defaultError = "unexpected_error"

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalDeviceModule"
  }

  @ReactMethod
  fun initialize(tenantID: String?, baseURL: String?, promise: Promise) {
    Log.d("AuthsignalDeviceModule", "initialize: $tenantID, $baseURL")
    authsignal = AuthsignalDevice(tenantID!!, baseURL!!)

    promise.resolve(null)
  }

  @ReactMethod
  fun getCredential(promise: Promise) {
    launch(promise) {
      val response = it.getCredential()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val credential = response.data
        val map = Arguments.createMap()
        map.putString("credentialId", credential!!.credentialId)
        map.putString("createdAt", credential.createdAt)
        map.putString("lastAuthenticatedAt", credential.lastAuthenticatedAt)
        promise.resolve(map)
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
        promise.resolve(response.data)
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
  fun getChallenge(promise: Promise) {
    launch(promise) {
      val response = it.getChallenge()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val challenge = response.data

        if (challenge == null) {
          promise.resolve(null)
        } else {
          val map = Arguments.createMap()
          map.putString("challengeId", challenge.challengeId)
          map.putString("actionCode", challenge.actionCode)
          map.putString("idempotencyKey", challenge.idempotencyKey)
          map.putString("ipAddress", challenge.ipAddress)
          map.putString("deviceId", challenge.deviceId)
          map.putString("userAgent", challenge.userAgent)
          promise.resolve(map)
        }
      }
    }
  }

  @ReactMethod
  fun claimChallenge(
    challengeId: String,
    promise: Promise
  ) {
    launch(promise) {
      val response = it.claimChallenge(challengeId)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val data = response.data
        if (data == null) {
          promise.resolve(null)
        } else {
          val map = Arguments.createMap()
          map.putBoolean("success", data.success)
          data.userAgent?.let { map.putString("userAgent", it) }
          data.ipAddress?.let { map.putString("ipAddress", it) }
          promise.resolve(map)
        }
      }
    }
  }

  @ReactMethod
  fun updateChallenge(
    challengeId: String,
    approved: Boolean,
    verificationCode: String?,
    promise: Promise
  ) {
    launch(promise) {
      val response = it.updateChallenge(challengeId, approved, verificationCode)

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
        Log.w("init_error", "AuthsignalDeviceModule is not initialized.")

        promise.resolve(null)
      }
    }
  }
}
