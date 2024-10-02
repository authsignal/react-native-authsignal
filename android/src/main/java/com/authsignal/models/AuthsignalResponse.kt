package com.authsignal.models

import kotlinx.serialization.Serializable

@Serializable
data class AuthsignalResponse<T>(
  val data: T? = null,
  val error: String? = null,
  val errorType: String? = null,
)
