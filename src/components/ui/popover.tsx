"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";

/** Anchored outside clipping ancestors; Escape/outside click restores focus. */
export function Popover({
  label,
  trigger,
  children,
  open,
  onOpenChange,
  className = "",
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!open) return;
    const panelElement = panel.current;
    const anchorElement = anchor.current;
    const place = () => {
      if (!anchor.current || !panel.current) return;
      const a = anchor.current.getBoundingClientRect(),
        p = panel.current.getBoundingClientRect();
      const top =
        a.bottom + 8 + p.height > window.innerHeight - 16 &&
        a.top > p.height + 16
          ? a.top - p.height - 8
          : a.bottom + 8;
      panel.current.style.left = `${Math.max(16, Math.min(a.left, window.innerWidth - p.width - 16))}px`;
      panel.current.style.top = `${Math.max(16, Math.min(top, window.innerHeight - p.height - 16))}px`;
    };
    const dismiss = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !anchor.current?.contains(event.target as Node)
      )
        onOpenChange(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onOpenChange(false);
        anchor.current?.focus({ preventScroll: true });
      }
    };
    place();
    panel.current
      ?.querySelector<HTMLElement>("button, a, input, textarea, select")
      ?.focus({ preventScroll: true });
    const resize = new ResizeObserver(place);
    if (panel.current) resize.observe(panel.current);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    document.addEventListener("pointerdown", dismiss);
    document.addEventListener("keydown", escape);
    return () => {
      if (
        panelElement?.contains(document.activeElement) ||
        document.activeElement === document.body
      )
        anchorElement?.focus({ preventScroll: true });
      resize.disconnect();
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
      document.removeEventListener("pointerdown", dismiss);
      document.removeEventListener("keydown", escape);
    };
  }, [open, onOpenChange]);
  function toggle() {
    onOpenChange(!open);
  }
  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label={typeof trigger === "string" ? undefined : label}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={toggle}
        className={className}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            role="dialog"
            aria-label={label}
            className="ui-popover"
          >
            <div className="mb-3 flex items-center justify-between gap-3">
              <p className="text-xs font-bold text-navy">{label}</p>
              <button
                type="button"
                aria-label={`Close ${label}`}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={() => {
                  onOpenChange(false);
                  anchor.current?.focus({ preventScroll: true });
                }}
              >
                ×
              </button>
            </div>
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}
