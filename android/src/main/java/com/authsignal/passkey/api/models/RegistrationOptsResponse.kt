package com.authsignal.passkey.api.models

import kotlinx.serialization.Serializable

@Serializable
data class RegistrationOptsResponse(
  val challengeId: String,
  val options: RegistrationOpts,
)

@Serializable
data class RegistrationOpts(
  val challenge: String,
  val rp: RegistrationOptsRelyingParty,
  val user: RegistrationOptsUser,
  val timeout: Int,
  val pubKeyCredParams: List<RegistrationOptsPubKeyCredParams>,
  val attestation: String,
  val excludeCredentials: List<RegistrationOptsExcludedCredential>,
  val authenticatorSelection: RegistrationOptsAuthenticatorSelection,
)

@Serializable
data class RegistrationOptsRelyingParty(
  val id: String,
  val name: String,
)

@Serializable
data class RegistrationOptsUser(
  val id: String,
  val name: String,
  val displayName: String,
)

@Serializable
data class RegistrationOptsPubKeyCredParams (
  val alg: Int,
  val type: String,
)

@Serializable
data class RegistrationOptsAuthenticatorSelection (
  val authenticatorAttachment: String? = "platform",
  val requireResidentKey: Boolean,
  val residentKey: String,
  val userVerification: String,
)

@Serializable
data class RegistrationOptsExcludedCredential(
  val id: String,
  val type: String,
)