package com.authsignal.passkey.models

import kotlinx.serialization.Serializable

@Serializable
data class SignUpResponse(
  val token: String? = null,
)
