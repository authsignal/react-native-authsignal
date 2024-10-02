package com.authsignal.passkey.models

import kotlinx.serialization.Serializable

@Serializable
data class PasskeyRegistrationCredential(
  val id: String,
  val rawId: String,
  val type: String,
  val authenticatorAttachment: String,
  val response: PasskeyRegistrationCredentialResponse,
)

@Serializable
data class PasskeyRegistrationCredentialResponse(
  val attestationObject: String,
  val clientDataJSON: String,
  val transports: List<String>? = null,
)
