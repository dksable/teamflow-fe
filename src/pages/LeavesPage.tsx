import { ReactNode } from "react";

import { EmptyState } from "../components/ui/state";

export function LeavesPage() {
  return (
    <PageShell title="Leaves" description="Apply for leave, view balances, and manage approvals.">
      <EmptyState
        description="Leave requests, balances, and approvals will appear here once leave management is enabled."
        title="No leave data available yet."
      />
    </PageShell>
  );
}

function PageShell({
  children,
  title,
  description,
}: {
  children: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <section>
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}
