package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthenticationOptsResponse(
  val challengeId: String,
  val options: AuthenticationOpts,
)

@Serializable
data class AuthenticationOpts(
  val challenge: String,
  val rpId: String,
  val allowCredentials: List<AuthenticationOptsCredential>,
)

@Serializable
data class AuthenticationOptsCredential(
  val id: String,
  val type: String,
)