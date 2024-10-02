package com.authsignal.totp.api.models

import kotlinx.serialization.Serializable

@Serializable
data class EnrollTOTPResponse(
  val userAuthenticatorId: String,
  val uri: String,
  val secret: String,

)
