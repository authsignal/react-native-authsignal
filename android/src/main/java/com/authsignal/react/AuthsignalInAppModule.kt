package com.authsignal.react

import android.util.Log
import com.authsignal.inapp.AuthsignalInApp
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@ReactModule(name = AuthsignalInAppModule.NAME)
class AuthsignalInAppModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalInAppModuleSpec(reactContext) {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var authsignal: AuthsignalInApp? = null
  private var defaultError = "unexpected_error"

  @ReactMethod
  override fun initialize(tenantID: String, baseURL: String, promise: Promise) {
    authsignal = AuthsignalInApp(tenantID, baseURL, context = reactContext)

    promise.resolve(null)
  }

  @ReactMethod
  override fun getCredential(username: String?, promise: Promise) {
    launch(promise) {
      val response = it.getCredential(username = username)

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
    username: String?,
    deviceIntegrity: Boolean,
    promise: Promise
  ) {
    launch(promise) {
      val response = it.addCredential(
        token = token,
        deviceName = null,
        userAuthenticationRequired = false,
        timeout = 0,
        authorizationType = 0,
        username = username,
        deviceIntegrity = deviceIntegrity,
      )

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
  override fun removeCredential(username: String?, promise: Promise) {
    launch(promise) {
      val response = it.removeCredential(username = username)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        promise.resolve(response.data)
      }
    }
  }

  @ReactMethod
  override fun verify(
    action: String?,
    username: String?,
    promise: Promise
  ) {
    launch(promise) {
      val response = it.verify(action = action, username = username)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val data = response.data
        if (data != null) {
          val map = Arguments.createMap()
          map.putString("token", data.token)
          map.putString("userId", data.userId)
          map.putString("userAuthenticatorId", data.userAuthenticatorId)
          map.putString("username", data.username)
          promise.resolve(map)
        } else {
          promise.reject(defaultError, "No data returned")
        }
      }
    }
  }

  @ReactMethod
  override fun createPin(pin: String, username: String, token: String?, promise: Promise) {
    launch(promise) {
      val response = it.createPin(
        pin = pin,
        username = username,
        token = token,
      )

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val data = response.data
        if (data != null) {
          val map = Arguments.createMap()
          map.putString("credentialId", data.credentialId)
          map.putString("createdAt", data.createdAt)
          map.putString("userId", data.userId)
          map.putString("lastAuthenticatedAt", data.lastAuthenticatedAt)
          promise.resolve(map)
        } else {
          promise.reject(defaultError, "No data returned")
        }
      }
    }
  }

  @ReactMethod
  override fun verifyPin(pin: String, username: String, action: String?, promise: Promise) {
    launch(promise) {
      val response = it.verifyPin(
        pin = pin,
        username = username,
        action = action,
      )

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val data = response.data
        if (data != null) {
          val map = Arguments.createMap()
          map.putBoolean("isVerified", data.isVerified)
          map.putString("token", data.token)
          map.putString("userId", data.userId)
          promise.resolve(map)
        } else {
          promise.reject(defaultError, "No data returned")
        }
      }
    }
  }

  @ReactMethod
  override fun deletePin(username: String, promise: Promise) {
    launch(promise) {
      val response = it.deletePin(username = username)

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        promise.resolve(response.data)
      }
    }
  }

  @ReactMethod
  override fun getAllPinUsernames(promise: Promise) {
    launch(promise) {
      val response = it.getAllPinUsernames()

      if (response.error != null) {
        val errorCode = response.errorCode ?: defaultError

        promise.reject(errorCode, response.error)
      } else {
        val usernames = Arguments.createArray()
        response.data?.forEach { username -> usernames.pushString(username) }
        promise.resolve(usernames)
      }
    }
  }

  private fun launch(promise: Promise, fn: suspend (client: AuthsignalInApp) -> Unit) {
    coroutineScope.launch {
      authsignal?.let {
        fn(it)
      }  ?: run {
        Log.w("init_error", "AuthsignalInAppModule is not initialized.")

        promise.resolve(null)
      }
    }
  }

  companion object {
    const val NAME = "AuthsignalInAppModule"
  }
}
