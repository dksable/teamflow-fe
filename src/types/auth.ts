export type User = {
  id: number;
  uuid: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  account_status: "invited" | "active" | "disabled" | string;
  role: "admin" | "view" | string;
  roles: string[];
  created_at: string;
  updated_at: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  user: User;
};

export type RefreshRequest = {
  refresh_token: string;
};

export type InvitationValidationResponse = {
  valid: boolean;
  email: string;
  expires_at: string;
};

export type SetPasswordRequest = {
  token: string;
  password: string;
  confirm_password: string;
};
