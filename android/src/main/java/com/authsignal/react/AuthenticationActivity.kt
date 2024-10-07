package com.authsignal.react

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import androidx.browser.customtabs.CustomTabsIntent

class AuthenticationActivity : Activity() {
  private var intentLaunched = false

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (savedInstanceState != null) {
      intentLaunched = savedInstanceState.getBoolean(EXTRA_INTENT_LAUNCHED, false)
    }
  }

  override fun onResume() {
    super.onResume()
    val authenticationIntent = intent

    if (!intentLaunched && authenticationIntent.extras == null) {
      finish()
      return
    } else if (!intentLaunched) {
      intentLaunched = true
      launchAuthenticationIntent()
      return
    }

    val resultMissing = authenticationIntent.data == null
    if (resultMissing) setResult(RESULT_CANCELED)
    else setResult(RESULT_OK, authenticationIntent)
    finish()
  }

  override fun onSaveInstanceState(outState: Bundle) {
    super.onSaveInstanceState(outState)
    outState.putBoolean(EXTRA_INTENT_LAUNCHED, intentLaunched)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
  }

  private fun launchAuthenticationIntent() {
    val extras = intent.extras
    val authorizeUri = extras!!.getParcelable<Uri>(EXTRA_AUTHORIZE_URI)
    val builder = CustomTabsIntent.Builder()
    val customTabsIntent = builder.build()
    customTabsIntent.launchUrl(this, authorizeUri!!)
  }

  companion object {
    const val AUTHENTICATION_REQUEST: Int = 1000
    const val EXTRA_AUTHORIZE_URI: String = "com.authsignal.react.EXTRA_AUTHORIZE_URI"
    private const val EXTRA_INTENT_LAUNCHED = "com.authsignal.react.EXTRA_INTENT_LAUNCHED"

    @JvmStatic
    fun authenticateUsingBrowser(activity: Activity, authorizeUri: Uri) {
      val intent = Intent(activity, AuthenticationActivity::class.java)
      intent.putExtra(EXTRA_AUTHORIZE_URI, authorizeUri)
      intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP)
      activity.startActivityForResult(intent, AUTHENTICATION_REQUEST)
    }
  }
}
