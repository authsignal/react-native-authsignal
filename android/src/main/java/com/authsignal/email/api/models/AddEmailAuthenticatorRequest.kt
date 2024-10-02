package com.authsignal.email.api.models

import kotlinx.serialization.Serializable

@Serializable
data class AddEmailAuthenticatorRequest(
  val email: String,
)