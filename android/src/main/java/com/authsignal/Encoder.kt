package com.authsignal

import android.util.Base64

object Encoder {
  fun toBase64String(input: ByteArray): String {
    return String(Base64.encode(input, Base64.NO_WRAP))
  }
}