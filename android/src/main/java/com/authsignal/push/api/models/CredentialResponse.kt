package com.authsignal.push.api.models

import kotlinx.serialization.Serializable

@Serializable
data class CredentialResponse(
  val userAuthenticatorId: String,
  val verifiedAt: String,
  val lastVerifiedAt: String? = null,
)
