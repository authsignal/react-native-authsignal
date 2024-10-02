package com.authsignal.passkey.api.models

import com.authsignal.passkey.models.PasskeyAuthenticationCredential
import kotlinx.serialization.Serializable

@Serializable
data class VerifyPasskeyRequest(
  val challengeId: String,
  val authenticationCredential: PasskeyAuthenticationCredential,
  val deviceId: String? = null,
)
