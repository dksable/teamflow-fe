import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useRef,
} from "react";

type DialogProps = {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  className?: string;
};

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

export function Dialog({
  children,
  className = "max-w-xl",
  description,
  onClose,
  open,
  title,
}: DialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const firstFocusable = dialogRef.current?.querySelector<HTMLElement>(focusableSelector);
    firstFocusable?.focus();

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
      previousActiveElement?.focus();
    };
  }, [open]);

  if (!open) {
    return null;
  }

  function handleTabKey(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 px-4 py-6">
      <button
        aria-label="Close modal"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={() => onCloseRef.current()}
        type="button"
      />
      <div
        aria-modal="true"
        className={`relative max-h-[90vh] w-full overflow-y-auto rounded-md border bg-card p-6 shadow-lg ${className}`}
        onKeyDown={handleTabKey}
        ref={dialogRef}
        role="dialog"
      >
        <h2 className="text-xl font-semibold">{title}</h2>
        {description ? (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
