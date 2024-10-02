package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class AddPasskeyAuthenticatorResponse(
  val isVerified: Boolean,
  val accessToken: String? = null,
  val userAuthenticatorId: String? = null,
)
