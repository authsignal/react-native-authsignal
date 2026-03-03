package com.authsignal.react

import android.util.Log
import com.authsignal.qr.AuthsignalQRCode
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@ReactModule(name = AuthsignalQRCodeModule.NAME)
class AuthsignalQRCodeModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalQRCodeModuleSpec(reactContext) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalQRCode? = null
  private var defaultError = "unexpected_error"

  @ReactMethod
  override fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    authsignal = AuthsignalQRCode(tenantID, baseURL)

    promise.resolve(null)
  }

  @ReactMethod
  override fun getCredential(promise: Promise) {
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
  override fun addCredential(
    token: String?,
    _requireUserAuthentication: Boolean,
    _keychainAccess: String?,
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
  override fun removeCredential(promise: Promise) {
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
  override fun claimChallenge(
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
          data.actionCode?.let { map.putString("actionCode", it) }
          data.idempotencyKey?.let { map.putString("idempotencyKey", it) }
          promise.resolve(map)
        }
      }
    }
  }

  @ReactMethod
  override fun updateChallenge(
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

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalQRCode) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalQRCodeModule is not initialized.")

        promise.resolve(null)
      }
    }
  }

  companion object {
    const val NAME = "AuthsignalQRCodeModule"
  }
}
