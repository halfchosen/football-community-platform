"use client";
import { useLayoutEffect, useRef, type ReactNode } from "react";
export function Dialog({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
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
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-lg font-bold text-navy">{title}</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${title}`}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-slate-500 hover:bg-slate-100"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
