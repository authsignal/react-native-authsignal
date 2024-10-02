package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthenticationOptsRequest(
  val challengeId: String? = null,
)