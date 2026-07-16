import { apiGet, apiPost } from "../lib/api";
import {
  InvitationValidationResponse,
  LoginRequest,
  LoginResponse,
  SetPasswordRequest,
  User,
} from "../types/auth";

export function loginUser(payload: LoginRequest) {
  return apiPost<LoginResponse>("/auth/login", payload);
}

export function refreshSession(refreshToken: string) {
  return apiPost<LoginResponse>("/auth/refresh", {
    refresh_token: refreshToken,
  });
}

export function logoutUser(refreshToken: string | null) {
  return apiPost<{ message: string }>("/auth/logout", {
    refresh_token: refreshToken,
  });
}

export function fetchCurrentUser() {
  return apiGet<User>("/auth/me");
}

export function validateInvitation(token: string) {
  return apiGet<InvitationValidationResponse>(
    `/auth/invitations/validate?token=${encodeURIComponent(token)}`,
  );
}

export function setInvitationPassword(payload: SetPasswordRequest) {
  return apiPost<{ message: string }>("/auth/invitations/set-password", payload);
}
