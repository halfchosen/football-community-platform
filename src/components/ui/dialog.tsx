"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { CloseIcon } from "./icons";

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) element.showModal();
    else if (!open && element.open) element.close();
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className="ui-dialog"
      aria-label={title}
      onCancel={onClose}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialog.current) {
          const rect = dialog.current.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="t-section text-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-[13px] leading-6 text-ink-3">
              {description}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="-mr-1 -mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-md text-ink-3 transition-colors hover:bg-sunken hover:text-ink"
        >
          <CloseIcon size={17} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
