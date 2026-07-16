import {
  KeyboardEvent,
  ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

type DropdownMenuProps = {
  open: boolean;
  triggerRef: React.RefObject<HTMLElement>;
  children: ReactNode;
  onClose: () => void;
};

export function DropdownMenu({
  open,
  triggerRef,
  children,
  onClose,
}: DropdownMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) {
      return;
    }

    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 6,
      left: Math.max(8, rect.right - 176),
    });
  }, [open, triggerRef]);

  useEffect(() => {
    if (!open) {
      return;
    }

    menuRef.current?.querySelector<HTMLElement>("button:not([disabled])")?.focus();

    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (
        menuRef.current?.contains(target) ||
        triggerRef.current?.contains(target)
      ) {
        return;
      }

      onCloseRef.current();
    }

    function handleKeyDown(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape") {
        onCloseRef.current();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, triggerRef]);

  if (!open) {
    return null;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "Tab") {
      return;
    }

    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>("button:not([disabled])") ?? [],
    );
    if (items.length === 0) {
      event.preventDefault();
      return;
    }

    const firstItem = items[0];
    const lastItem = items[items.length - 1];

    if (event.shiftKey && document.activeElement === firstItem) {
      event.preventDefault();
      lastItem.focus();
    } else if (!event.shiftKey && document.activeElement === lastItem) {
      event.preventDefault();
      firstItem.focus();
    }
  }

  return (
    <div
      className="fixed z-[60] w-44 rounded-md border bg-card p-1 shadow-lg"
      onKeyDown={handleKeyDown}
      ref={menuRef}
      role="menu"
      style={{ top: position.top, left: position.left }}
    >
      {children}
    </div>
  );
}

export function DropdownMenuItem({
  children,
  destructive = false,
  onSelect,
}: {
  children: ReactNode;
  destructive?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`flex w-full items-center gap-2 rounded-sm px-3 py-2 text-left text-sm ${
        destructive
          ? "text-red-600 hover:bg-red-50"
          : "text-foreground hover:bg-muted"
      }`}
      onClick={onSelect}
      role="menuitem"
      type="button"
    >
      {children}
    </button>
  );
}
