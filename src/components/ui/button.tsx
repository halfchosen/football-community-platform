import type {
  ButtonHTMLAttributes,
  AnchorHTMLAttributes,
  ReactNode,
} from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

/**
 * Action hierarchy, expressed once.
 *
 *  primary   — the one thing this surface wants you to do (solid navy)
 *  secondary — a real alternative (outlined)
 *  ghost     — repeated, low-commitment actions in dense rows
 *  quiet     — tertiary/ambient actions; almost invisible until hovered
 *  danger    — destructive confirmation only
 *
 * Every surface should have at most one primary. Sensitive or rare actions
 * (Report, Delete) belong in `quiet` or, better, an overflow menu.
 */
export type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "quiet"
  | "danger"
  | "inverse";
export type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex select-none items-center justify-center gap-1.5 rounded-md font-semibold transition-colors duration-100 outline-none focus-visible:ring-2 focus-visible:ring-navy/35 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45";

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9 px-3.5 text-[13.5px]",
  lg: "h-11 px-5 text-sm",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-navy text-white shadow-[0_1px_2px_rgb(11_18_32/0.16)] hover:bg-navy-strong active:bg-navy-strong",
  secondary:
    "border border-line-strong bg-surface text-ink hover:border-ink-4 hover:bg-sunken",
  ghost: "text-ink-2 hover:bg-navy-wash hover:text-navy",
  quiet: "text-ink-3 hover:bg-sunken hover:text-ink",
  danger: "bg-danger text-white hover:brightness-110",
  inverse: "bg-white text-navy hover:bg-white/90",
};

type Shared = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Renders a square icon-only control with an accessible label. */
  iconOnly?: boolean;
};

const iconSizes: Record<ButtonSize, string> = {
  sm: "h-8 w-8 px-0",
  md: "h-9 w-9 px-0",
  lg: "h-11 w-11 px-0",
};

export function buttonClass({
  variant = "primary",
  size = "md",
  iconOnly = false,
  className,
}: Shared & { className?: string } = {}) {
  return cn(
    base,
    iconOnly ? iconSizes[size] : sizes[size],
    variants[variant],
    className,
  );
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & Shared;

export function Button({
  className,
  variant,
  size,
  iconOnly,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={buttonClass({ variant, size, iconOnly, className })}
      type={type}
      {...props}
    />
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  Shared & { href: string; children: ReactNode };

export function ButtonLink({
  className,
  variant,
  size,
  iconOnly,
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={buttonClass({ variant, size, iconOnly, className })}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Inline action used inside dense rows (post footers, cards). Smaller and
 * lighter than a Button so a row of them never competes with the content.
 */
export function InlineAction({
  active = false,
  className,
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-navy/35",
        active
          ? "bg-navy-wash text-navy"
          : "text-ink-3 hover:bg-sunken hover:text-ink",
        className,
      )}
      type={type}
      {...props}
    />
  );
}
