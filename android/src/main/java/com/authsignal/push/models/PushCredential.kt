package com.authsignal.push.models

data class PushCredential(
  val credentialId: String,
  val createdAt: String,
  val lastAuthenticatedAt: String?
)