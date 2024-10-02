package com.authsignal.models

import kotlinx.serialization.Serializable

@Serializable
data class EnrollResponse(
  val userAuthenticatorId: String,
)
