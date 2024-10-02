package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class RegistrationOptsRequest(
  val username: String? = null,
  val displayName: String? = null,
)
