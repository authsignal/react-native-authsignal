package com.authsignal.passkey.api.models

import com.authsignal.passkey.models.PasskeyRegistrationCredential
import kotlinx.serialization.Serializable

@Serializable
data class AddPasskeyAuthenticatorRequest(
  val challengeId: String,
  val registrationCredential: PasskeyRegistrationCredential,
)