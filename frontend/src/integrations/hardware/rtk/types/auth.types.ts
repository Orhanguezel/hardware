// =============================================================
// FILE: src/integrations/hardware/rtk/types/auth.types.ts
// Auth istek / cevap tipleri
// =============================================================

import type { UserDto } from "./user.types";

export interface BaseApiSuccess {
  success: boolean;
  message?: string;
}

/* ---------- Requests ---------- */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  password2: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: unknown;
}

export interface VerifyEmailRequest {
  email: string;
  token: string;
}

/**
 * resend_verification hiçbir body almıyor, sadece token header ile çalışıyor
 */
export type ResendVerificationRequest = void;

/**
 * change_password_view için body
 */
export interface ChangePasswordRequest {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

/** ---------- Password Reset Flow ---------- */

/**
 * POST /auth/request-password-reset/
 * Body: { email }
 */
export interface RequestPasswordResetRequest {
  email: string;
}

/**
 * POST /auth/verify-reset-code/
 * Body: { email, code }
 */
export interface VerifyResetCodeRequest {
  email: string;
  code: string;
}

/**
 * POST /auth/reset-password/
 * Body: { email, code, new_password, new_password2? }
 */
export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
  new_password2?: string;
}

/* ---------- Responses (success durumları) ---------- */

export interface LoginSuccessResponse extends BaseApiSuccess {
  token: string;
  user: UserDto;
  email_verification_required?: boolean;
  email?: string;
}

export interface RegisterSuccessResponse extends BaseApiSuccess {
  token: string;
  user: UserDto;
  email_sent: boolean;
}

/** 
 * Önceden:
 *   export interface LogoutResponse extends BaseApiSuccess {}
 * ESLint: no-empty-object-type
 * Çözüm: type alias
 */
export type LogoutResponse = BaseApiSuccess;

export interface VerifyEmailResponse extends BaseApiSuccess {
  user: UserDto;
}

/**
 * Önceden:
 *   export interface ResendVerificationResponse extends BaseApiSuccess {}
 */
export type ResendVerificationResponse = BaseApiSuccess;

export interface CheckEmailVerificationStatusResponse extends BaseApiSuccess {
  email_verified: boolean;
  email_verified_at: string | null;
  user: UserDto;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

/** ---------- Password Reset Responses ---------- */

export interface RequestPasswordResetResponse extends BaseApiSuccess {
  // İstersen buraya backend'in döndüğü ekstra alanları ekleyebilirsin (ör: email vs.)
  email?: string;
}

export interface VerifyResetCodeResponse extends BaseApiSuccess {
  email?: string;
  // Eğer backend reset token döndürüyorsa onu da buraya ekleyebilirsin:
  // reset_token?: string;
}

/**
 * Önceden:
 *   export interface ResetPasswordResponse extends BaseApiSuccess {}
 */
export type ResetPasswordResponse = BaseApiSuccess;
