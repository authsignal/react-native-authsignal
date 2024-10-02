package com.authsignal.passkey.models

import kotlinx.serialization.Serializable

@Serializable
data class PasskeyAuthenticationCredential(
  val id: String,
  val rawId: String,
  val type: String,
  val response: PasskeyAuthenticationCredentialResponse,
)

@Serializable
data class PasskeyAuthenticationCredentialResponse(
  val authenticatorData: String,
  val clientDataJSON: String,
  val signature: String,
  val userHandle: String,
)