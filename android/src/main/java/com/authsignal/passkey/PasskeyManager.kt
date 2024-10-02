package com.authsignal.passkey

import android.content.Context
import android.util.Log
import androidx.credentials.*
import androidx.credentials.exceptions.*
import com.authsignal.models.AuthsignalResponse
import com.authsignal.passkey.models.*
import kotlinx.serialization.json.Json
import kotlinx.serialization.decodeFromString

private const val TAG = "com.authsignal.passkey"

class PasskeyManager(private val context: Context) {
  private val credentialManager = CredentialManager.create(context)

  suspend fun register(
    requestJson: String,
    preferImmediatelyAvailableCredentials: Boolean
  ): AuthsignalResponse<PasskeyRegistrationCredential> {
    val request = CreatePublicKeyCredentialRequest(
      requestJson = requestJson,
      preferImmediatelyAvailableCredentials = preferImmediatelyAvailableCredentials,
    )

    return try {
      val response = credentialManager.createCredential(
        context = context,
        request = request,
      ) as CreatePublicKeyCredentialResponse

      val responseJson = response.registrationResponseJson

      val data = Json.decodeFromString<PasskeyRegistrationCredential>(responseJson)

      AuthsignalResponse(data = data)
    } catch (e : CreateCredentialCancellationException){
      AuthsignalResponse(
        error = "The user canceled the passkey creation request.",
        errorType = "user_canceled"
      )
    } catch (e : CreateCredentialException){
      Log.e(TAG, "createCredential failed: ${e.message}")

      AuthsignalResponse(error = "Unexpected exception: ${e.message}")
    }
  }

  suspend fun auth(requestJson: String): AuthsignalResponse<PasskeyAuthenticationCredential> {
    val getPublicKeyCredentialOption = GetPublicKeyCredentialOption(requestJson = requestJson)

    val request = GetCredentialRequest(
      listOf(getPublicKeyCredentialOption)
    )

    return try {
      val response = credentialManager.getCredential(
        context = context,
        request = request,
      )

      val publicKeyCredential = response.credential as PublicKeyCredential

      val responseJson = publicKeyCredential.authenticationResponseJson

      val data = Json.decodeFromString<PasskeyAuthenticationCredential>(responseJson)

      AuthsignalResponse(data = data)
    } catch(e: GetCredentialCancellationException) {
      AuthsignalResponse(
        error = "The user canceled the passkey authentication request.",
        errorType = "user_canceled"
      )
    } catch(e: NoCredentialException) {
      AuthsignalResponse(
        error = "No credential is available for the passkey authentication request.",
        errorType = "no_credential"
      )
    } catch (e : GetCredentialException){
      Log.e(TAG, "getCredential failed: ${e.message}")

      AuthsignalResponse(error = "Unexpected exception: ${e.message}")
    }
  }
}