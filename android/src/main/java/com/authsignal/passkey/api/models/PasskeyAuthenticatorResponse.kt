package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class PasskeyAuthenticatorResponse(
  val credentialId: String,
  val verifiedAt: String,
)
