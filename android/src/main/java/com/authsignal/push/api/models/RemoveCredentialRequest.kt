package com.authsignal.push.api.models

import kotlinx.serialization.Serializable

@Serializable
data class RemoveCredentialRequest(
  val publicKey: String,
  val signature: String,
)