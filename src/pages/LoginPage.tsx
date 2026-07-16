import { FormEvent, useState } from "react";
import { LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "../components/ui/button";
import { getApiErrorMessage, useAuth } from "../contexts/AuthContext";
import { companyLogoUrl } from "../lib/branding";

export function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("admin@teamflow.ai");
  const [password, setPassword] = useState("Admin@123");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await login({ email, password });
      toast.success("Logged in");
      navigate("/dashboard", { replace: true });
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-md border bg-card p-8 shadow-sm">
        <div className="mb-5 rounded-md bg-[#010510] px-4 py-3">
          <img alt="Ingenero" className="h-10 w-auto" src={companyLogoUrl} />
        </div>
        <h1 className="text-3xl font-semibold">TeamFlow</h1>
        <p className="mt-2 text-sm text-muted-foreground">Sign in to manage attendance, leaves, and timesheets.</p>
        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium">
            Email
            <input
              className="mt-2 h-10 w-full rounded-md border bg-background px-3"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label className="block text-sm font-medium">
            Password
            <input
              className="mt-2 h-10 w-full rounded-md border bg-background px-3"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          <Button className="w-full" disabled={loading} type="submit">
            <LogIn className="h-4 w-4" />
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
      </section>
    </main>
  );
}
