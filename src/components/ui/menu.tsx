"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils/cn";

/**
 * Overflow menu for tertiary and sensitive actions (Report, Delete, Manage).
 * Portalled so it escapes the feed's clipping containers; Escape and outside
 * clicks close it and return focus to the trigger.
 */
export function Menu({
  label,
  trigger,
  children,
  open,
  onOpenChange,
  className,
  align = "end",
}: {
  label: string;
  trigger: ReactNode;
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
  align?: "start" | "end";
}) {
  const anchor = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const enterFromEnd = useRef(false);

  useLayoutEffect(() => {
    if (!open) return;
    const panelElement = panel.current;
    const anchorElement = anchor.current;

    const place = () => {
      if (!anchor.current || !panel.current) return;
      const a = anchor.current.getBoundingClientRect();
      const p = panel.current.getBoundingClientRect();
      const below = a.bottom + 6;
      const top =
        below + p.height > window.innerHeight - 12 && a.top > p.height + 12
          ? a.top - p.height - 6
          : below;
      const left = align === "end" ? a.right - p.width : a.left;
      panel.current.style.left = `${Math.max(12, Math.min(left, window.innerWidth - p.width - 12))}px`;
      panel.current.style.top = `${Math.max(12, Math.min(top, window.innerHeight - p.height - 12))}px`;
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
    const items = panel.current?.querySelectorAll<HTMLElement>(
      '[role="menuitem"]:not(:disabled)',
    );
    if (items?.length)
      items[enterFromEnd.current ? items.length - 1 : 0].focus({
        preventScroll: true,
      });
    enterFromEnd.current = false;
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
  }, [open, onOpenChange, align]);

  return (
    <>
      <button
        ref={anchor}
        type="button"
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => onOpenChange(!open)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            enterFromEnd.current = event.key === "ArrowUp";
            onOpenChange(true);
          }
        }}
        className={className}
      >
        {trigger}
      </button>
      {open &&
        createPortal(
          <div
            ref={panel}
            role="menu"
            aria-label={label}
            className="ui-menu"
            onKeyDown={(event) => {
              if (event.key === "Tab") {
                onOpenChange(false);
                return;
              }
              if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key))
                return;
              event.preventDefault();
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  '[role="menuitem"]:not(:disabled)',
                ),
              );
              if (!items.length) return;
              const current = items.indexOf(
                document.activeElement as HTMLElement,
              );
              const next =
                event.key === "Home"
                  ? 0
                  : event.key === "End"
                    ? items.length - 1
                    : (current +
                        (event.key === "ArrowDown" ? 1 : -1) +
                        items.length) %
                      items.length;
              items[next].focus({ preventScroll: true });
            }}
          >
            {children}
          </div>,
          document.body,
        )}
    </>
  );
}

export function MenuItem({
  icon,
  children,
  tone = "default",
  onClick,
}: {
  icon?: ReactNode;
  children: ReactNode;
  tone?: "default" | "danger";
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 rounded-[5px] px-2.5 py-2 text-left text-[13px] font-medium transition-colors",
        tone === "danger"
          ? "text-danger hover:bg-danger-wash"
          : "text-ink-2 hover:bg-sunken hover:text-ink",
      )}
    >
      {icon ? <span className="shrink-0 text-ink-4">{icon}</span> : null}
      {children}
    </button>
  );
}
