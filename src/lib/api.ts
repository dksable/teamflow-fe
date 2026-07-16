import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./auth";
import { LoginResponse } from "../types/auth";

const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const apiClient = axios.create({
  baseURL: apiUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<LoginResponse> | null = null;

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      refreshPromise ??= axios
        .post<LoginResponse>(`${apiUrl}/auth/refresh`, {
          refresh_token: refreshToken,
        })
        .then((response) => response.data)
        .finally(() => {
          refreshPromise = null;
        });

      const refreshed = await refreshPromise;
      setTokens({
        accessToken: refreshed.access_token,
        refreshToken: refreshed.refresh_token,
      });
      originalRequest.headers.Authorization = `Bearer ${refreshed.access_token}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearTokens();
      return Promise.reject(refreshError);
    }
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong";
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path);
  return response.data;
}

export async function apiPost<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<T>(path, body);
  return response.data;
}

export async function apiPut<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.put<T>(path, body);
  return response.data;
}

export async function apiPatch<T>(path: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<T>(path, body);
  return response.data;
}

export async function apiDelete(path: string): Promise<void> {
  await apiClient.delete(path);
}
