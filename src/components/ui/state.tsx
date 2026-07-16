import { AlertCircle, Loader2, SearchX } from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "./button";

type StateBlockProps = {
  className?: string;
  description?: string;
  title: string;
};

export function LoadingState({
  className,
  title = "Loading...",
}: {
  className?: string;
  title?: string;
}) {
  return (
    <div className={cn("mt-6 grid min-h-40 place-items-center rounded-md border bg-card p-6 text-center", className)}>
      <div>
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#f5821f]" />
        <p className="mt-3 text-sm font-medium">{title}</p>
      </div>
    </div>
  );
}

export function EmptyState({ className, description, title }: StateBlockProps) {
  return (
    <div className={cn("mt-6 grid min-h-40 place-items-center rounded-md border bg-card p-6 text-center", className)}>
      <div>
        <SearchX className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

export function ErrorState({
  className,
  description = "Please try again in a moment.",
  onRetry,
  title,
}: StateBlockProps & { onRetry?: () => void }) {
  return (
    <div className={cn("mt-6 grid min-h-40 place-items-center rounded-md border bg-card p-6 text-center", className)}>
      <div>
        <AlertCircle className="mx-auto h-8 w-8 text-red-500" />
        <p className="mt-3 text-sm font-semibold">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {onRetry ? (
          <Button className="mt-4" onClick={onRetry} type="button">
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
