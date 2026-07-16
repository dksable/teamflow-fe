import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../../contexts/AuthContext";

function AuthLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <p className="text-sm text-muted-foreground">Loading...</p>
    </main>
  );
}

export function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
