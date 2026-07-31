package com.authsignal.react

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.browser.customtabs.CustomTabsIntent

class AuthenticationActivity : ComponentActivity() {
  private var authenticationLaunched = false
  private var authenticationCompleted = false
  private val mainHandler = Handler(Looper.getMainLooper())
  private val completeCancellation = Runnable { completeAuthentication(null) }

  private val browserLauncher =
    registerForActivityResult(ActivityResultContracts.StartActivityForResult()) { result ->
      when (result.resultCode) {
        RESULT_OK -> {
          val redirectUri = result.data?.data
          if (redirectUri == null) {
            completeWithError("malformed_url", "The browser returned an empty redirect URL.")
          } else {
            completeAuthentication(redirectUri)
          }
        }
        // A classic Custom Tab reports cancellation while handing a custom-scheme redirect back
        // to the app. Give RedirectActivity.onNewIntent a brief chance to deliver that URI before
        // treating the result as a user cancellation.
        RESULT_CANCELED ->
          mainHandler.postDelayed(completeCancellation, REDIRECT_GRACE_PERIOD_MILLIS)
        else ->
          completeWithError(
            "authentication_failed",
            "The browser could not complete authentication (result code ${result.resultCode})."
          )
      }
    }

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    if (savedInstanceState != null) {
      authenticationLaunched =
        savedInstanceState.getBoolean(EXTRA_AUTHENTICATION_LAUNCHED, false)
      authenticationCompleted =
        savedInstanceState.getBoolean(EXTRA_AUTHENTICATION_COMPLETED, false)
    }

    intent.data?.let {
      completeAuthentication(it)
      return
    }

    if (authenticationCompleted) {
      finish()
      return
    }

    if (authenticationLaunched) {
      return
    }

    val authorizeUri =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        intent.getParcelableExtra(EXTRA_AUTHORIZE_URI, Uri::class.java)
      } else {
        @Suppress("DEPRECATION")
        intent.getParcelableExtra(EXTRA_AUTHORIZE_URI)
      }
    if (authorizeUri == null) {
      completeWithError("invalid_url", "The authentication URL is missing.")
      return
    }

    authenticationLaunched = true
    launchAuthenticationIntent(authorizeUri)
  }

  override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putBoolean(EXTRA_AUTHENTICATION_LAUNCHED, authenticationLaunched)
    outState.putBoolean(EXTRA_AUTHENTICATION_COMPLETED, authenticationCompleted)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    intent.data?.let(::completeAuthentication)
  }

  private fun launchAuthenticationIntent(authorizeUri: Uri) {
    try {
      val customTabsIntent = CustomTabsIntent.Builder().build()

      // Auth Tab is a public Custom Tabs intent protocol. Sending its stable extras directly keeps
      // this SDK compatible with compileSdk 35 while browser 1.9+ requires compileSdk 36.
      customTabsIntent.intent
        .setData(authorizeUri)
        .putExtra(EXTRA_LAUNCH_AUTH_TAB, true)
        .putExtra(EXTRA_REDIRECT_SCHEME, CALLBACK_SCHEME)

      browserLauncher.launch(customTabsIntent.intent)
    } catch (exception: ActivityNotFoundException) {
      completeWithError("browser_not_available", "No browser app is installed.")
    }
  }

  private fun completeAuthentication(redirectUri: Uri?) {
    if (authenticationCompleted) return

    mainHandler.removeCallbacks(completeCancellation)
    authenticationCompleted = true
    if (redirectUri == null) {
      setResult(RESULT_CANCELED)
    } else {
      setResult(RESULT_OK, Intent().setData(redirectUri))
    }
    finish()
  }

  private fun completeWithError(code: String, message: String) {
    if (authenticationCompleted) return

    authenticationCompleted = true
    val result =
      Intent()
        .putExtra(EXTRA_ERROR_CODE, code)
        .putExtra(EXTRA_ERROR_MESSAGE, message)
    setResult(RESULT_CANCELED, result)
    finish()
  }

  companion object {
    const val AUTHENTICATION_REQUEST: Int = 1000
    const val CALLBACK_SCHEME: String = "authsignal"
    const val EXTRA_AUTHORIZE_URI: String = "com.authsignal.react.EXTRA_AUTHORIZE_URI"
    const val EXTRA_ERROR_CODE: String = "com.authsignal.react.EXTRA_ERROR_CODE"
    const val EXTRA_ERROR_MESSAGE: String = "com.authsignal.react.EXTRA_ERROR_MESSAGE"
    private const val EXTRA_LAUNCH_AUTH_TAB = "androidx.browser.auth.extra.LAUNCH_AUTH_TAB"
    private const val EXTRA_REDIRECT_SCHEME = "androidx.browser.auth.extra.REDIRECT_SCHEME"
    private const val EXTRA_AUTHENTICATION_LAUNCHED =
      "com.authsignal.react.EXTRA_AUTHENTICATION_LAUNCHED"
    private const val EXTRA_AUTHENTICATION_COMPLETED =
      "com.authsignal.react.EXTRA_AUTHENTICATION_COMPLETED"
    private const val REDIRECT_GRACE_PERIOD_MILLIS = 1_000L

    @JvmStatic
    fun authenticateUsingBrowser(activity: Activity, authorizeUri: Uri) {
      val intent = Intent(activity, AuthenticationActivity::class.java)
      intent.putExtra(EXTRA_AUTHORIZE_URI, authorizeUri)
      intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
      activity.startActivityForResult(intent, AUTHENTICATION_REQUEST)
    }
  }
}
