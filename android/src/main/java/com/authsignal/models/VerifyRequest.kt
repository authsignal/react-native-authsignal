package com.authsignal.models

import kotlinx.serialization.Serializable

@Serializable
data class VerifyRequest(
  val verificationCode: String,
)
