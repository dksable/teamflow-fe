import { ReactNode } from "react";

import { EmptyState } from "../components/ui/state";

export function AssistantPage() {
  return (
    <PageShell title="Assistant" description="Chat about leave policies, holidays, and timesheet rules.">
      <EmptyState
        description="The assistant workspace will appear here once it is connected."
        title="Assistant is not available yet."
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
