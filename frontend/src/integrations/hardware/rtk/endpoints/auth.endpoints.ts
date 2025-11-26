// =============================================================
// FILE: src/integrations/hardware/rtk/endpoints/auth.endpoints.ts
// =============================================================

import { hardwareApi } from "../baseApi";
import type {
  LoginRequest,
  LoginSuccessResponse,
  RegisterRequest,
  RegisterSuccessResponse,
  LogoutResponse,
  VerifyEmailRequest,
  VerifyEmailResponse,
  ResendVerificationRequest,
  ResendVerificationResponse,
  CheckEmailVerificationStatusResponse,
  RequestPasswordResetRequest,
  RequestPasswordResetResponse,
  VerifyResetCodeRequest,
  VerifyResetCodeResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "../types/auth.types";

/**
 * Tüm URL'ler, baseApi'deki DJANGO_API_URL_BROWSER (örn: http://localhost:8000/api)
 * üzerine relative olarak ekleniyor.
 */
export const authApi = hardwareApi.injectEndpoints({
  endpoints: (build) => ({
    /**
     * POST /api/auth/login/
     */
    login: build.mutation<LoginSuccessResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),

    /**
     * POST /api/auth/register/
     */
    register: build.mutation<RegisterSuccessResponse, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * POST /api/auth/logout/
     */
    logout: build.mutation<LogoutResponse, void>({
      query: () => ({
        url: "/auth/logout/",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),

    /**
     * POST /api/auth/verify-email/
     */
    verifyEmail: build.mutation<VerifyEmailResponse, VerifyEmailRequest>({
      query: (body) => ({
        url: "/auth/verify-email/",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth", "User"],
    }),

    /**
     * POST /api/auth/resend-verification/
     */
    resendVerification: build.mutation<
      ResendVerificationResponse,
      ResendVerificationRequest
    >({
      query: () => ({
        url: "/auth/resend-verification/",
        method: "POST",
      }),
    }),

    /**
     * GET /api/auth/check-verification-status/
     */
    checkEmailVerificationStatus: build.query<
      CheckEmailVerificationStatusResponse,
      void
    >({
      query: () => "/auth/check-verification-status/",
      providesTags: ["Auth"],
    }),

    /* ---------- PASSWORD RESET FLOW ---------- */

    /**
     * POST /api/auth/request-password-reset/
     */
    requestPasswordReset: build.mutation<
      RequestPasswordResetResponse,
      RequestPasswordResetRequest
    >({
      query: (body) => ({
        url: "/auth/request-password-reset/",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /api/auth/verify-reset-code/
     */
    verifyResetCode: build.mutation<
      VerifyResetCodeResponse,
      VerifyResetCodeRequest
    >({
      query: (body) => ({
        url: "/auth/verify-reset-code/",
        method: "POST",
        body,
      }),
    }),

    /**
     * POST /api/auth/reset-password/
     */
    resetPassword: build.mutation<
      ResetPasswordResponse,
      ResetPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/reset-password/",
        method: "POST",
        body,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useVerifyEmailMutation,
  useResendVerificationMutation,
  useCheckEmailVerificationStatusQuery,
  useRequestPasswordResetMutation,
  useVerifyResetCodeMutation,
  useResetPasswordMutation,
} = authApi;
