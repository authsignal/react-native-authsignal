package com.authsignal.models

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class VerifyResponse(
  val isVerified: Boolean,
  @SerialName("accessToken")
  val token: String? = null,
  val failureReason: String? = null,
)
