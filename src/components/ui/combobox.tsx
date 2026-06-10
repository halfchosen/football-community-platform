"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  group?: string;
  sublabel?: string | null;
  /** Visible but not selectable, e.g. league already used or club already picked. */
  disabled?: boolean;
  /** Short reason shown on the disabled row. */
  disabledHint?: string;
};

export type ComboboxFooterAction = {
  id: string;
  label: string;
  icon?: ReactNode;
};

type ComboboxProps = {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** Controlled special options pinned under the list (e.g. "Not listed"). */
  footerActions?: ComboboxFooterAction[];
  onFooterAction?: (id: string) => void;
  getLeading?: (option: ComboboxOption) => ReactNode;
  invalid?: boolean;
  /** Start in the open state (used when the menu is summoned from a slot). */
  defaultOpen?: boolean;
  /** Fired whenever the menu closes (selection, escape, or click-away). */
  onClose?: () => void;
  /**
   * Render only the search/list panel (no trigger), always open. The caller is
   * responsible for positioning it (e.g. as a floating overlay above a slot).
   */
  asPanel?: boolean;
};

// Accessible searchable select used for club / national team pickers. Replaces
// the old league dropdown + search input + native <select> stack with a single
// modern combobox so optional selections no longer feel like a catalog.
export function Combobox({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Type to search",
  emptyMessage = "No matches found",
  footerActions = [],
  onFooterAction,
  getLeading,
  invalid = false,
  defaultOpen = false,
  onClose,
  asPanel = false,
}: ComboboxProps) {
  const [open, setOpen] = useState(defaultOpen || asPanel);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);

  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const selected = options.find((option) => option.value === value) ?? null;

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) {
      return options;
    }
    return options.filter((option) =>
      `${option.label} ${option.sublabel ?? ""} ${option.group ?? ""}`
        .toLowerCase()
        .includes(needle),
    );
  }, [options, query]);

  // Flattened, grouped render order; keyboard navigation walks the enabled
  // subset of this array (disabled rows stay visible but are skipped), then
  // continues into the pinned footer actions.
  const groups = useMemo(() => groupOptions(filtered), [filtered]);
  const footerStart = filtered.length;
  const navIndexes = useMemo(() => {
    const enabled = filtered.flatMap((option, index) =>
      option.disabled ? [] : [index],
    );
    return [
      ...enabled,
      ...footerActions.map((_, index) => filtered.length + index),
    ];
  }, [filtered, footerActions]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const handlePointer = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };
    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, [open, closeMenu]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const frame = requestAnimationFrame(() => searchRef.current?.focus());
    return () => cancelAnimationFrame(frame);
  }, [open]);

  function commit(optionValue: string) {
    onChange(optionValue);
    closeMenu();
  }

  function commitFooter(actionId: string) {
    onFooterAction?.(actionId);
    closeMenu();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(
        (index) =>
          navIndexes.find((candidate) => candidate > index) ??
          navIndexes[navIndexes.length - 1] ??
          index,
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(
        (index) =>
          [...navIndexes].reverse().find((candidate) => candidate < index) ??
          navIndexes[0] ??
          index,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (active >= footerStart && footerActions[active - footerStart]) {
        commitFooter(footerActions[active - footerStart].id);
      } else if (filtered[active] && !filtered[active].disabled) {
        commit(filtered[active].value);
      }
    } else if (event.key === "Escape") {
      event.preventDefault();
      closeMenu();
    }
  }

  const triggerLabel = selected?.label ?? placeholder;

  const panel = (
    <div className="w-full overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xl shadow-stone-900/10">
      <div className="border-b border-stone-100 p-2">
        <div className="relative">
          <svg
            aria-hidden
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" strokeLinecap="round" />
          </svg>
          <input
            aria-label={searchPlaceholder}
            className="h-10 w-full rounded-lg border border-stone-200 bg-stone-50 pl-9 pr-3 text-sm outline-none transition focus:border-stone-400 focus:bg-white focus:ring-2 focus:ring-stone-300/60"
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            ref={searchRef}
            type="search"
            value={query}
          />
        </div>
      </div>

      <ul className="max-h-64 overflow-y-auto py-1" id={listId} role="listbox">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-stone-500">
            {emptyMessage}
          </li>
        ) : (
          groups.map((group) => (
            <li key={group.key}>
              {group.label ? (
                <p className="sticky top-0 bg-white px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-stone-400">
                  {group.label}
                </p>
              ) : null}
              <ul>
                {group.items.map((item) => {
                  const flatIndex = filtered.indexOf(item);
                  const isActive = flatIndex === active;
                  const isSelected = item.value === value;

                  if (item.disabled) {
                    return (
                      <li
                        aria-disabled
                        aria-selected={false}
                        key={item.value}
                        role="option"
                      >
                        <span className="flex w-full cursor-not-allowed items-center gap-2.5 px-3 py-2 text-left text-sm opacity-45">
                          {getLeading ? getLeading(item) : null}
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-stone-900">
                              {item.label}
                            </span>
                            {item.sublabel ? (
                              <span className="block truncate text-xs text-stone-400">
                                {item.sublabel}
                              </span>
                            ) : null}
                          </span>
                          {item.disabledHint ? (
                            <span className="shrink-0 rounded-full bg-stone-200 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-stone-500">
                              {item.disabledHint}
                            </span>
                          ) : null}
                        </span>
                      </li>
                    );
                  }

                  return (
                    <li key={item.value} role="option" aria-selected={isSelected}>
                      <button
                        className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition ${
                          isActive ? "bg-stone-100" : "hover:bg-stone-50"
                        }`}
                        onClick={() => commit(item.value)}
                        onMouseEnter={() => setActive(flatIndex)}
                        type="button"
                      >
                        {getLeading ? getLeading(item) : null}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-stone-900">
                            {item.label}
                          </span>
                          {item.sublabel ? (
                            <span className="block truncate text-xs text-stone-400">
                              {item.sublabel}
                            </span>
                          ) : null}
                        </span>
                        {isSelected ? (
                          <CheckIcon className="h-4 w-4 shrink-0 text-emerald-700" />
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))
        )}
      </ul>

      {footerActions.length > 0 ? (
        <div className="border-t border-stone-100">
          {footerActions.map((action, index) => {
            const flatIndex = footerStart + index;
            return (
              <button
                className={`flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm font-semibold transition ${
                  active === flatIndex
                    ? "bg-stone-100 text-stone-900"
                    : "text-stone-700 hover:bg-stone-50"
                }`}
                key={action.id}
                onClick={() => commitFooter(action.id)}
                onMouseEnter={() => setActive(flatIndex)}
                type="button"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-stone-200 text-xs text-stone-600">
                  {action.icon ?? "+"}
                </span>
                {action.label}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );

  if (asPanel) {
    return <div ref={rootRef}>{panel}</div>;
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        aria-controls={listId}
        aria-expanded={open}
        aria-haspopup="listbox"
        className={`flex h-12 w-full items-center gap-2.5 rounded-xl border bg-white px-3.5 text-left text-sm shadow-[0_1px_0_rgba(0,0,0,0.02)] outline-none transition hover:border-stone-400 focus:ring-4 focus:ring-stone-300/50 ${
          invalid
            ? "border-red-300 focus:border-red-500"
            : open
              ? "border-stone-500 ring-4 ring-stone-300/50"
              : "border-stone-300"
        }`}
        onClick={() => (open ? closeMenu() : setOpen(true))}
        type="button"
      >
        {selected && getLeading ? getLeading(selected) : null}
        <span
          className={`flex-1 truncate ${
            selected ? "text-stone-950" : "text-stone-400"
          }`}
        >
          {triggerLabel}
        </span>
        <svg
          aria-hidden
          className={`h-4 w-4 shrink-0 text-stone-400 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open ? <div className="absolute z-30 mt-2 w-full">{panel}</div> : null}
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      viewBox="0 0 24 24"
    >
      <path d="m5 13 4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function groupOptions(options: ComboboxOption[]) {
  const order: string[] = [];
  const map = new Map<string, ComboboxOption[]>();

  for (const option of options) {
    const key = option.group ?? "";
    if (!map.has(key)) {
      map.set(key, []);
      order.push(key);
    }
    map.get(key)!.push(option);
  }

  return order.map((key) => ({
    key: key || "__ungrouped__",
    label: key,
    items: map.get(key)!,
  }));
}
