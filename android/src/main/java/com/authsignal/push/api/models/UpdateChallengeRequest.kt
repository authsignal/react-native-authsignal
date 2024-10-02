package com.authsignal.push.api.models

import kotlinx.serialization.Serializable

@Serializable
data class UpdateChallengeRequest(
  val publicKey: String,
  val challengeId: String,
  val signature: String,
  val approved: Boolean,
  val verificationCode: String?,
)