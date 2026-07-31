package com.authsignal.react

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.authsignal.DeviceCache
import com.authsignal.TokenCache.Companion.shared
import com.authsignal.react.AuthenticationActivity.Companion.AUTHENTICATION_REQUEST
import com.authsignal.react.AuthenticationActivity.Companion.CALLBACK_SCHEME
import com.authsignal.react.AuthenticationActivity.Companion.EXTRA_ERROR_CODE
import com.authsignal.react.AuthenticationActivity.Companion.EXTRA_ERROR_MESSAGE
import com.authsignal.react.AuthenticationActivity.Companion.authenticateUsingBrowser
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.module.annotations.ReactModule
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch

@ReactModule(name = AuthsignalModule.NAME)
class AuthsignalModule(private val reactContext: ReactApplicationContext) :
  NativeAuthsignalModuleSpec(reactContext), ActivityEventListener {
  private val coroutineScope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
  private var launchPromise: Promise? = null

  init {
    reactContext.addActivityEventListener(this)
    DeviceCache.shared.initialize(reactContext.applicationContext)
  }

  @ReactMethod
  override fun setToken(token: String?, promise: Promise) {
    shared.token = token

    promise.resolve("token_set")
  }

  @ReactMethod
  override fun launch(url: String?, promise: Promise) {
    if (launchPromise != null) {
      promise.reject(
        "launch_in_progress",
        "Another Authsignal browser flow is already in progress."
      )
      return
    }

    if (url == null) {
      promise.reject("invalid_url", "Launch URL must not be null.")
      return
    }

    val activity = reactContext.currentActivity
    val parsedUrl = buildLaunchUri(url)
    this.launchPromise = promise

    try {
      if (activity != null) {
        authenticateUsingBrowser(activity, parsedUrl)
      } else {
        promise.reject("activity_not_available", "Android Activity is null.")
        this.launchPromise = null
      }
    } catch (e: ActivityNotFoundException) {
      promise.reject("browser_not_available", "No browser app is installed")
      this.launchPromise = null
    }
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    if (requestCode != AUTHENTICATION_REQUEST) return

    val pendingPromise = launchPromise ?: return
    launchPromise = null

    val errorCode = data?.getStringExtra(EXTRA_ERROR_CODE)
    if (errorCode != null) {
      pendingPromise.reject(
        errorCode,
        data.getStringExtra(EXTRA_ERROR_MESSAGE) ?: "Authentication failed."
      )
      return
    }

    if (resultCode == Activity.RESULT_CANCELED) {
      pendingPromise.resolve(null)
      return
    }

    val redirectUri = data?.data
    if (resultCode != Activity.RESULT_OK || redirectUri == null) {
      pendingPromise.reject("malformed_url", "Malformed redirect URL.")
      return
    }

    val token = redirectUri.getQueryParameter("token")
    if (token != null) {
      shared.token = token
    }
    pendingPromise.resolve(token)
  }

  @ReactMethod
  override fun getDeviceId(promise: Promise) {
    coroutineScope.launch {
      val deviceId = DeviceCache.shared.getDefaultDeviceId()
      promise.resolve(deviceId)
    }
  }

  override fun onNewIntent(intent: Intent) {
  }

  private fun buildLaunchUri(url: String): Uri {
    val parsedUrl = Uri.parse(url)
    val builder = parsedUrl.buildUpon().clearQuery()

    for (queryName in parsedUrl.queryParameterNames) {
      if (queryName == NATIVE_SCHEME_QUERY_PARAM) continue

      for (queryValue in parsedUrl.getQueryParameters(queryName)) {
        builder.appendQueryParameter(queryName, queryValue)
      }
    }

    builder.appendQueryParameter(NATIVE_SCHEME_QUERY_PARAM, CALLBACK_SCHEME)

    return builder.build()
  }

  companion object {
    const val NAME = "AuthsignalModule"
    private const val NATIVE_SCHEME_QUERY_PARAM = "nativeScheme"
  }
}
