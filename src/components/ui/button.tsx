import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils/cn";

const buttonClassName =
  "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
};

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost";
};

function variantClassName(variant: ButtonProps["variant"] = "primary") {
  if (variant === "secondary") {
    return "border border-slate-300 bg-white text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50";
  }

  if (variant === "ghost") {
    return "bg-transparent text-slate-700 hover:bg-slate-100";
  }

  return "bg-violet-700 text-white shadow-sm shadow-violet-700/25 hover:bg-violet-600";
}

export function Button({
  className,
  variant,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonClassName, variantClassName(variant), className)}
      type={type}
      {...props}
    />
  );
}

export function ButtonLink({
  className,
  variant,
  href,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonClassName, variantClassName(variant), className)}
      href={href}
      {...props}
    >
      {children}
    </Link>
  );
}
