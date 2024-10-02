package com.authsignal.totp

import com.authsignal.TokenCache
import com.authsignal.totp.api.TOTPAPI
import com.authsignal.models.AuthsignalResponse
import com.authsignal.totp.api.models.EnrollTOTPResponse
import com.authsignal.models.VerifyResponse
import kotlinx.coroutines.DelicateCoroutinesApi
import kotlinx.coroutines.GlobalScope
import kotlinx.coroutines.future.future
import java.util.concurrent.CompletableFuture

class AuthsignalTOTP(
  tenantID: String,
  baseURL: String
) {
  private val api = TOTPAPI(tenantID, baseURL)
  private val cache = TokenCache.shared

  suspend fun enroll(): AuthsignalResponse<EnrollTOTPResponse> {
    val token = cache.token ?: return cache.handleTokenNotSetError()

    return api.enroll(token)
  }

  suspend fun verify(code: String): AuthsignalResponse<VerifyResponse> {
    val token = cache.token ?: return cache.handleTokenNotSetError()

    val verifyResponse = api.verify(token, code)

    verifyResponse.data?.token.let {
      cache.token = it
    }

    return verifyResponse
  }

  @OptIn(DelicateCoroutinesApi::class)
  fun enrollAsync(): CompletableFuture<AuthsignalResponse<EnrollTOTPResponse>> =
    GlobalScope.future { enroll() }

  @OptIn(DelicateCoroutinesApi::class)
  fun verifyAsync(code: String): CompletableFuture<AuthsignalResponse<VerifyResponse>> =
    GlobalScope.future { verify(code) }
}