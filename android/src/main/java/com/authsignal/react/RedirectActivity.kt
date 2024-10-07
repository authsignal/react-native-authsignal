package com.authsignal.react

import android.app.Activity
import android.content.Intent
import android.os.Bundle
import com.authsignal.react.AuthenticationActivity

class RedirectActivity : Activity() {
  public override fun onCreate(savedInstanceBundle: Bundle?) {
    super.onCreate(savedInstanceBundle)
    val intent = Intent(this, AuthenticationActivity::class.java)
    intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_SINGLE_TOP)
    if (getIntent() != null) intent.setData(getIntent().data)
    startActivity(intent)
    finish()
  }
}
