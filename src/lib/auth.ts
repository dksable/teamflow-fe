const accessTokenKey = "teamflow_access_token";
const refreshTokenKey = "teamflow_refresh_token";

export type StoredTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getAccessToken() {
  return window.localStorage.getItem(accessTokenKey);
}

export function getRefreshToken() {
  return window.localStorage.getItem(refreshTokenKey);
}

export function setTokens(tokens: StoredTokens) {
  window.localStorage.setItem(accessTokenKey, tokens.accessToken);
  window.localStorage.setItem(refreshTokenKey, tokens.refreshToken);
}

export function clearTokens() {
  window.localStorage.removeItem(accessTokenKey);
  window.localStorage.removeItem(refreshTokenKey);
}

export function hasTokens() {
  return Boolean(getAccessToken() && getRefreshToken());
}
