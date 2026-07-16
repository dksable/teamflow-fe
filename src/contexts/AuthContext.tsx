import {
  createContext,
  ReactNode,
  useContext,
  useMemo,
} from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  hasTokens,
  setTokens,
} from "../lib/auth";
import { getApiErrorMessage } from "../lib/api";
import {
  fetchCurrentUser,
  loginUser,
  logoutUser,
  refreshSession,
} from "../services/authService";
import { LoginRequest, User } from "../types/auth";

type AuthContextValue = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const userQuery = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchCurrentUser,
    enabled: hasTokens(),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (response) => {
      setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });
      queryClient.setQueryData(["auth", "me"], response.user);
    },
  });

  const refreshMutation = useMutation({
    mutationFn: async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        throw new Error("Missing refresh token");
      }

      return refreshSession(refreshToken);
    },
    onSuccess: (response) => {
      setTokens({
        accessToken: response.access_token,
        refreshToken: response.refresh_token,
      });
      queryClient.setQueryData(["auth", "me"], response.user);
    },
    onError: () => {
      clearTokens();
      queryClient.removeQueries({ queryKey: ["auth"] });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => logoutUser(getRefreshToken()),
    onSettled: () => {
      clearTokens();
      queryClient.clear();
    },
  });

  const value = useMemo<AuthContextValue>(
    () => ({
      user: userQuery.data ?? null,
      accessToken: getAccessToken(),
      refreshToken: getRefreshToken(),
      loading:
        userQuery.isLoading ||
        loginMutation.isPending ||
        refreshMutation.isPending ||
        logoutMutation.isPending,
      isAuthenticated: Boolean(userQuery.data && hasTokens()),
      login: async (payload) => {
        await loginMutation.mutateAsync(payload);
      },
      logout: async () => {
        await logoutMutation.mutateAsync();
      },
      refresh: async () => {
        await refreshMutation.mutateAsync();
      },
    }),
    [
      loginMutation,
      logoutMutation,
      refreshMutation,
      userQuery.data,
      userQuery.isLoading,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

export { getApiErrorMessage };
