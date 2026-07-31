package com.authsignal.react

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import androidx.activity.ComponentActivity
import androidx.activity.result.contract.ActivityResultContracts
import androidx.browser.customtabs.CustomTabsIntent
import androidx.browser.customtabs.CustomTabsService

class AuthenticationActivity : ComponentActivity() {
  private var authenticationLaunched = false
  private var authenticationCompleted = false
  private var authTabSupported = false
  private var cancellationDeadlineMillis = 0L
  private val mainHandler = Handler(Looper.getMainLooper())
  private val completeCancellation =
    Runnable {
      cancellationDeadlineMillis = 0L
      completeAuthentication(null)
    }

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
        RESULT_CANCELED -> {
          if (authTabSupported) {
            completeAuthentication(null)
          } else {
            scheduleCancellation()
          }
        }
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
      authTabSupported =
        savedInstanceState.getBoolean(EXTRA_AUTH_TAB_SUPPORTED, false)
      cancellationDeadlineMillis =
        savedInstanceState.getLong(EXTRA_CANCELLATION_DEADLINE_MILLIS, 0L)
    }

    intent.data?.let {
      completeAuthentication(it)
      return
    }

    if (authenticationCompleted) {
      finish()
      return
    }

    if (cancellationDeadlineMillis > 0L) {
      scheduleCancellation(cancellationDeadlineMillis)
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
    outState.putBoolean(EXTRA_AUTH_TAB_SUPPORTED, authTabSupported)
    outState.putLong(EXTRA_CANCELLATION_DEADLINE_MILLIS, cancellationDeadlineMillis)
  }

  override fun onDestroy() {
    mainHandler.removeCallbacks(completeCancellation)
    super.onDestroy()
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    intent.data?.let(::completeAuthentication)
  }

  private fun launchAuthenticationIntent(authorizeUri: Uri) {
    try {
      val customTabsIntent = CustomTabsIntent.Builder().build()

      customTabsIntent.intent
        .setData(authorizeUri)
        .putExtra(EXTRA_LAUNCH_AUTH_TAB, true)
        .putExtra(EXTRA_REDIRECT_SCHEME, CALLBACK_SCHEME)

      authTabSupported = isAuthTabSupported(customTabsIntent.intent)
      browserLauncher.launch(customTabsIntent.intent)
    } catch (exception: ActivityNotFoundException) {
      completeWithError("browser_not_available", "No browser app is installed.")
    }
  }

  private fun isAuthTabSupported(browserIntent: Intent): Boolean {
    val browserPackage = browserIntent.resolveActivity(packageManager)?.packageName ?: return false
    val serviceIntent =
      Intent(CustomTabsService.ACTION_CUSTOM_TABS_CONNECTION)
        .setPackage(browserPackage)
        .addCategory(CATEGORY_AUTH_TAB)

    val service =
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        packageManager.resolveService(
          serviceIntent,
          PackageManager.ResolveInfoFlags.of(0)
        )
      } else {
        @Suppress("DEPRECATION")
        packageManager.resolveService(serviceIntent, 0)
      }

    return service != null
  }

  private fun scheduleCancellation(
    deadlineMillis: Long = SystemClock.elapsedRealtime() + REDIRECT_GRACE_PERIOD_MILLIS
  ) {
    cancellationDeadlineMillis = deadlineMillis
    mainHandler.removeCallbacks(completeCancellation)
    mainHandler.postDelayed(
      completeCancellation,
      maxOf(0L, deadlineMillis - SystemClock.elapsedRealtime())
    )
  }

  private fun completeAuthentication(redirectUri: Uri?) {
    if (authenticationCompleted) return

    mainHandler.removeCallbacks(completeCancellation)
    cancellationDeadlineMillis = 0L
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

    mainHandler.removeCallbacks(completeCancellation)
    cancellationDeadlineMillis = 0L
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
    private const val EXTRA_AUTH_TAB_SUPPORTED =
      "com.authsignal.react.EXTRA_AUTH_TAB_SUPPORTED"
    private const val EXTRA_CANCELLATION_DEADLINE_MILLIS =
      "com.authsignal.react.EXTRA_CANCELLATION_DEADLINE_MILLIS"
    private const val CATEGORY_AUTH_TAB = "androidx.browser.auth.category.AuthTab"
    private const val REDIRECT_GRACE_PERIOD_MILLIS = 5_000L

    @JvmStatic
    fun authenticateUsingBrowser(activity: Activity, authorizeUri: Uri) {
      val intent = Intent(activity, AuthenticationActivity::class.java)
      intent.putExtra(EXTRA_AUTHORIZE_URI, authorizeUri)
      intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
      activity.startActivityForResult(intent, AUTHENTICATION_REQUEST)
    }
  }
}
