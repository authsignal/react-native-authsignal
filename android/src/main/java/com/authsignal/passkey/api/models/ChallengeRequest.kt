package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class ChallengeRequest(
  val action: String,
)
