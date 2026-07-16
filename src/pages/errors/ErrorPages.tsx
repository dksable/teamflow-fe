import { Link } from "react-router-dom";

import { Button } from "../../components/ui/button";

function ErrorPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <section className="w-full max-w-md rounded-md border bg-card p-8 text-center shadow-sm">
        <h1 className="text-3xl font-semibold">{title}</h1>
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>
        <Button asChild className="mt-6">
          <Link to="/dashboard">Go to dashboard</Link>
        </Button>
      </section>
    </main>
  );
}

export function UnauthorizedPage() {
  return (
    <ErrorPage
      title="401"
      description="You need to sign in before viewing this page."
    />
  );
}

export function ForbiddenPage() {
  return (
    <ErrorPage
      title="403"
      description="Your account does not have permission to view this page."
    />
  );
}

export function NotFoundPage() {
  return (
    <ErrorPage
      title="404"
      description="The page you are looking for does not exist."
    />
  );
}
