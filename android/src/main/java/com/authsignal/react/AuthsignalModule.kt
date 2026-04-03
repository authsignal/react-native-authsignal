package com.authsignal.react

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.authsignal.DeviceCache
import com.authsignal.TokenCache.Companion.shared
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
import java.net.URLDecoder

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
    if (url == null) {
      promise.reject("invalid_url", "Launch URL must not be null.")
      return
    }

    val activity = reactContext.currentActivity
    val parsedUrl = Uri.parse(url)
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
    val pendingPromise = this@AuthsignalModule.launchPromise ?: return

    val hasResult =
      resultCode == Activity.RESULT_OK && requestCode == AuthenticationActivity.AUTHENTICATION_REQUEST && data!!.data != null

    if (hasResult) {
      try {
        val redirectUrl = data!!.data.toString()
        val query = redirectUrl.split("[?]".toRegex()).dropLastWhile { it.isEmpty() }
          .toTypedArray()[1]
        val pairs = query.split("&".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
        var token: String? = null
        for (pair in pairs) {
          val index = pair.indexOf("=")
          val name = URLDecoder.decode(pair.substring(0, index), "UTF-8")
          val value = URLDecoder.decode(pair.substring(index + 1), "UTF-8")
          if (name == "token") {
            token = value

            shared.token = value
          }
        }
        pendingPromise.resolve(token)
      } catch (ex: Exception) {
        pendingPromise.reject("malformed_url", "Malformed redirect url")
      }
    } else {
      pendingPromise.resolve(null)
    }

    this@AuthsignalModule.launchPromise = null
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

  companion object {
    const val NAME = "AuthsignalModule"
  }
}
