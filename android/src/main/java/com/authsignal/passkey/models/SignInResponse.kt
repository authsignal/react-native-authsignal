package com.authsignal.passkey.models

import kotlinx.serialization.Serializable

@Serializable
data class SignInResponse(
  val isVerified: Boolean,
  val token: String? = null,
  val userId: String? = null,
  val userAuthenticatorId: String? = null,
  val username: String? = null,
  val displayName: String? = null,
)
