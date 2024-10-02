package com.authsignal.push

import android.os.Build
import com.authsignal.TokenCache
import com.authsignal.models.AuthsignalResponse
import com.authsignal.push.api.PushAPI
import com.authsignal.push.models.PushChallenge
import com.authsignal.push.models.PushCredential
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.future.future
import java.security.Signature
import java.util.concurrent.CompletableFuture
import kotlin.math.floor

class AuthsignalPush(
  tenantID: String,
  baseURL: String) {
  private val api = PushAPI(tenantID, baseURL)

  suspend fun getCredential(): AuthsignalResponse<PushCredential> {
    val publicKeyResponse = KeyManager.getPublicKey()

    val publicKey = publicKeyResponse.data
      ?: return AuthsignalResponse(error = publicKeyResponse.error)

    return api.getCredential(publicKey)
  }

  suspend fun addCredential(
    token: String? = null,
    deviceName: String? = null,
    userAuthenticationRequired: Boolean = false,
    timeout: Int = 0,
    authorizationType: Int = 0,
  ): AuthsignalResponse<Boolean> {
    val userToken = token ?: TokenCache.shared.token ?: return TokenCache.shared.handleTokenNotSetError()

    val publicKeyResponse = KeyManager.getOrCreatePublicKey(
      userAuthenticationRequired,
      timeout,
      authorizationType
    )

    val publicKey = publicKeyResponse.data ?: return AuthsignalResponse(
      data = false,
      error = publicKeyResponse.error,
      errorType = publicKeyResponse.errorType,
    )

    val device = deviceName ?: getDeviceName()

    return api.addCredential(userToken, publicKey, device)
  }

  suspend fun removeCredential(signer: Signature? = null): AuthsignalResponse<Boolean> {
    val keyResponse = KeyManager.getKey()

    val key = keyResponse.data
      ?: return AuthsignalResponse(error = keyResponse.error)

    val publicKey = KeyManager.derivePublicKey(key)

    val message = getTimeBasedDataToSign()

    val signatureResponse = if (signer != null) {
      Signer.finishSigning(message, signer)
    } else {
      Signer.sign(message, key)
    }

    val signature = signatureResponse.data ?: return AuthsignalResponse(error = signatureResponse.error)

    val removeCredentialResponse = api.removeCredential(publicKey, signature)

    return AuthsignalResponse(
      data = KeyManager.deleteKey(),
      error = removeCredentialResponse.error,
      errorType = removeCredentialResponse.errorType,
    )
  }

  suspend fun getChallenge(): AuthsignalResponse<PushChallenge?> {
    val publicKeyResponse = KeyManager.getPublicKey()

    val publicKey = publicKeyResponse.data
      ?: return AuthsignalResponse(error = publicKeyResponse.error)

    val pushChallengeResponse = api.getChallenge(publicKey)

    val pushChallengeData = pushChallengeResponse.data
      ?: return AuthsignalResponse(data = null)

    val challengeId = pushChallengeData.challengeId
      ?: return AuthsignalResponse(data = null)

    val userId = pushChallengeData.userId
      ?: return AuthsignalResponse(data = null)

    val pushChallenge = PushChallenge(
      challengeId = challengeId,
      userId = userId,
      actionCode = pushChallengeData.actionCode,
      idempotencyKey = pushChallengeData.idempotencyKey,
      userAgent = pushChallengeData.userAgent,
      ipAddress = pushChallengeData.ipAddress,
      deviceId = pushChallengeData.deviceId,
    )

    return AuthsignalResponse(data = pushChallenge)
  }

  suspend fun updateChallenge(
    challengeId: String,
    approved: Boolean,
    verificationCode: String? = null,
    signer: Signature? = null
  ): AuthsignalResponse<Boolean> {
    val keyResponse = KeyManager.getKey()

    val key = keyResponse.data
      ?: return AuthsignalResponse(error = keyResponse.error)

    val signatureResponse = if (signer != null) {
      Signer.finishSigning(challengeId, signer)
    } else {
      Signer.sign(challengeId, key)
    }

    val signature = signatureResponse.data ?: return AuthsignalResponse(error = signatureResponse.error)

    val publicKey = KeyManager.derivePublicKey(key)

    return api.updateChallenge(challengeId, publicKey, signature, approved, verificationCode)
  }

  fun startSigning(): Signature? {
    val keyResponse = KeyManager.getKey()

    val key = keyResponse.data
      ?: return null

    return Signer.startSigning(key)
  }

  private fun getTimeBasedDataToSign(): String {
    val secondsSinceEpoch = (System.currentTimeMillis() / 1000).toDouble()

    return floor(secondsSinceEpoch / (60 * 10)).toString()
  }

  private fun getDeviceName(): String {
    val manufacturer = Build.MANUFACTURER
    val model = Build.MODEL

    if (model.startsWith(manufacturer)) {
      return model
    }

    return "$manufacturer $model"
  }

  @OptIn(DelicateCoroutinesApi::class)
  fun getCredentialAsync(): CompletableFuture<AuthsignalResponse<PushCredential>> =
    GlobalScope.future { getCredential() }

  @OptIn(DelicateCoroutinesApi::class)
  fun addCredentialAsync(
    token: String? = null,
    deviceName: String? = null,
  ): CompletableFuture<AuthsignalResponse<Boolean>> =
    GlobalScope.future {
      addCredential(
        token,
        deviceName,
      )
    }

  @OptIn(DelicateCoroutinesApi::class)
  fun removeCredentialAsync(): CompletableFuture<AuthsignalResponse<Boolean>> =
    GlobalScope.future { removeCredential() }

  @OptIn(DelicateCoroutinesApi::class)
  fun getChallengeAsync(): CompletableFuture<AuthsignalResponse<PushChallenge?>> =
    GlobalScope.future { getChallenge() }

  @OptIn(DelicateCoroutinesApi::class)
  fun updateChallengeAsync(
    challengeId: String,
    approved: Boolean,
    verificationCode: String? = null,
  ): CompletableFuture<AuthsignalResponse<Boolean>> =
    GlobalScope.future { updateChallenge(challengeId, approved, verificationCode) }
}