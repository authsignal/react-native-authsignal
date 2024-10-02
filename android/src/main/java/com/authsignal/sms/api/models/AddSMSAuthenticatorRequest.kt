package com.authsignal.sms.api.models

import kotlinx.serialization.Serializable

@Serializable
data class AddSMSAuthenticatorRequest(
  val phoneNumber: String,
)