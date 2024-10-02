package com.authsignal.models

import kotlinx.serialization.Serializable

@Serializable
data class ChallengeResponse(
  val challengeId: String,
)
