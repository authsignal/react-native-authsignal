package com.authsignal.react

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import com.authsignal.TokenCache.Companion.shared
import com.authsignal.react.AuthenticationActivity.Companion.authenticateUsingBrowser
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.net.URLDecoder

class AuthsignalModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(
    reactContext
  ), ActivityEventListener {
  private var callback: Callback? = null

  init {
    reactContext.addActivityEventListener(this)
  }

  override fun getConstants(): Map<String, Any>? {
    val constants: MutableMap<String, Any> = HashMap()
    constants["bundleIdentifier"] = reactContext.applicationInfo.packageName
    return constants
  }

  override fun getName(): String {
    return "AuthsignalModule"
  }

  @ReactMethod
  fun setToken(token: String?, promise: Promise) {
    shared.token = token

    promise.resolve("token_set")
  }

  @ReactMethod
  fun launch(url: String?, callback: Callback) {
    val activity = currentActivity
    val parsedUrl = Uri.parse(url)
    this.callback = callback

    try {
      if (activity != null) {
        authenticateUsingBrowser(activity, parsedUrl)
      } else {
        val error = Arguments.createMap()
        error.putString("error", "activity_not_available")
        error.putString("error_description", "Android Activity is null.")
        callback.invoke(error)
      }
    } catch (e: ActivityNotFoundException) {
      val error = Arguments.createMap()
      error.putString("error", "browser_not_available")
      error.putString("error_description", "No browser app is installed")
      callback.invoke(error)
    }
  }

  override fun onActivityResult(
    activity: Activity,
    requestCode: Int,
    resultCode: Int,
    data: Intent?
  ) {
    val cb = this@AuthsignalModule.callback ?: return

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
        cb.invoke(null, token)
      } catch (ex: Exception) {
        val error = Arguments.createMap()
        error.putString("error", "malformed_url")
        error.putString("error_description", "Malformed redirect url")
        cb.invoke(error)
      }
    } else {
      val error = Arguments.createMap()
      error.putString("error", "user_cancelled")
      error.putString("error_description", "User cancelled")
      cb.invoke(error)
    }

    this@AuthsignalModule.callback = null
  }

  override fun onNewIntent(intent: Intent) {
  }
}
