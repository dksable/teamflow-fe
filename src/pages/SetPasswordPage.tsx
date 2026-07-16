import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "../lib/api";
import { setInvitationPassword, validateInvitation } from "../services/authService";
import { Button } from "../components/ui/button";

export function SetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validationQuery = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => validateInvitation(token),
    enabled: Boolean(token),
    retry: false,
  });

  const setPasswordMutation = useMutation({
    mutationFn: setInvitationPassword,
  });

  useEffect(() => {
    if (!token) {
      setError("This invitation link is invalid or has expired.");
    }
  }, [token]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      await setPasswordMutation.mutateAsync({
        token,
        password,
        confirm_password: confirmPassword,
      });
      toast.success("Password created successfully. You can now log in.");
      navigate("/login", { replace: true });
    } catch (submissionError) {
      setError(getApiErrorMessage(submissionError));
    }
  }

  const isInvalid = !token || validationQuery.isError;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-md rounded-md border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Set Your Password</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Create a password to activate your WorkPilot account.
        </p>

        {validationQuery.isLoading ? (
          <p className="mt-6 text-sm text-muted-foreground">Validating invitation...</p>
        ) : isInvalid ? (
          <div className="mt-6 space-y-4">
            <p className="text-sm text-red-600">
              This invitation link is invalid or has expired.
            </p>
            <p className="text-sm text-muted-foreground">
              Please contact your administrator for a new invitation.
            </p>
            <Button asChild type="button" variant="outline">
              <Link to="/login">Go to Login</Link>
            </Button>
          </div>
        ) : (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium" htmlFor="password">
              New Password
              <input
                className="mt-2 h-10 w-full rounded-md border bg-background px-3"
                id="password"
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                value={password}
              />
            </label>
            <label className="block text-sm font-medium" htmlFor="confirm_password">
              Confirm Password
              <input
                className="mt-2 h-10 w-full rounded-md border bg-background px-3"
                id="confirm_password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </label>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              className="w-full"
              disabled={setPasswordMutation.isPending}
              type="submit"
            >
              {setPasswordMutation.isPending ? "Setting Password..." : "Set Password"}
            </Button>
          </form>
        )}
      </section>
    </main>
  );
}
