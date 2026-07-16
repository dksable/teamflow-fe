import { useAuth } from "../contexts/AuthContext";

export type UserRole = "admin" | "view";

export function usePermissions() {
  const { user } = useAuth();
  const role = normalizeRole(user?.role ?? user?.roles[0]);
  const isAdmin = role === "admin";

  return {
    role,
    canView: Boolean(user),
    canCreate: isAdmin,
    canEdit: isAdmin,
    canDelete: isAdmin,
    canUpload: isAdmin,
  };
}

function normalizeRole(role: string | undefined): UserRole {
  return role === "admin" ? "admin" : "view";
}
