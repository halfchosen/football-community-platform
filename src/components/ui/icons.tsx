import type { SVGProps } from "react";

/**
 * One line-icon family for the whole product: 24px grid, 1.7 stroke,
 * round caps. Icons inherit colour and size from their button, so an
 * action's weight is set by its container, never by the glyph.
 *
 * These replace the emoji that used to stand in for icons (⚽ ★ ↗ ⚠️ 🔥),
 * which read as placeholder art and broke the type hierarchy.
 */
export type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Icon({ size = 16, children, ...props }: IconProps) {
  return (
    <svg
      aria-hidden
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.7}
      viewBox="0 0 24 24"
      width={size}
      {...props}
    >
      {children}
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="10.5" cy="10.5" r="6.75" />
      <path d="m15.6 15.6 4.4 4.4" />
    </Icon>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M18 8.5a6 6 0 1 0-12 0c0 4.2-1.2 5.6-2 6.6-.3.4 0 1 .5 1h15c.5 0 .8-.6.5-1-.8-1-2-2.4-2-6.6Z" />
      <path d="M10 19.5a2.2 2.2 0 0 0 4 0" />
    </Icon>
  );
}

export function ChevronDownIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 9.5 6 6 6-6" />
    </Icon>
  );
}

export function ChevronLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m14.5 6-6 6 6 6" />
    </Icon>
  );
}

export function ChevronRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 6 6 6-6 6" />
    </Icon>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 12h15M13.5 6l6 6-6 6" />
    </Icon>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M19.5 12h-15M10.5 6l-6 6 6 6" />
    </Icon>
  );
}

export function ReplyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20.5 11.6c0 4.4-3.8 7.9-8.5 7.9a9.4 9.4 0 0 1-3.4-.6l-5.1 1.6 1.6-4.2a7.6 7.6 0 0 1-1.6-4.7c0-4.4 3.8-7.9 8.5-7.9s8.5 3.5 8.5 7.9Z" />
    </Icon>
  );
}

export function StarIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon {...props}>
      <path
        d="m12 3.9 2.5 5.1 5.6.8-4 3.9 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4-3.9 5.6-.8L12 3.9Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

export function BookmarkIcon({ filled = false, ...props }: IconProps & { filled?: boolean }) {
  return (
    <Icon {...props}>
      <path
        d="M6.5 4.75h11a.75.75 0 0 1 .75.75v13.9a.4.4 0 0 1-.62.33L12 15.9l-5.63 3.83a.4.4 0 0 1-.62-.33V5.5a.75.75 0 0 1 .75-.75Z"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

export function ShareIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 15.5v-12M8 7.5 12 3.5l4 4" />
      <path d="M5 12.5v6.25c0 .69.56 1.25 1.25 1.25h11.5c.69 0 1.25-.56 1.25-1.25V12.5" />
    </Icon>
  );
}

export function FlagIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5.5 21V4" />
      <path d="M5.5 5.2h11.9c.5 0 .8.6.4 1l-2.6 3 2.6 3c.4.4.1 1-.4 1H5.5" />
    </Icon>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="5.5" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="18.5" cy="12" r="1.35" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function CloseIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Icon>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4.5 12.5 4.8 4.8L19.5 7" />
    </Icon>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 5.25v13.5M5.25 12h13.5" />
    </Icon>
  );
}

export function AlertIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 7.75v5" />
      <circle cx="12" cy="16.1" r=".95" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function InfoIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.75" />
      <path d="M12 11.5v4.75" />
      <circle cx="12" cy="8.1" r=".95" fill="currentColor" stroke="none" />
    </Icon>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="4.75" y="10.25" width="14.5" height="9.5" rx="1.75" />
      <path d="M8.25 10.25V7.9a3.75 3.75 0 0 1 7.5 0v2.35" />
    </Icon>
  );
}

export function ExternalIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 4.5h6v6" />
      <path d="m19.5 4.5-8 8" />
      <path d="M18 14.5v4.25c0 .69-.56 1.25-1.25 1.25H5.25C4.56 20 4 19.44 4 18.75V7.25C4 6.56 4.56 6 5.25 6H9.5" />
    </Icon>
  );
}

export function TrashIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.75 6.75h14.5M9.5 6.75V5.5c0-.7.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v1.25" />
      <path d="M6.75 6.75 7.6 19a1.25 1.25 0 0 0 1.25 1.15h6.3A1.25 1.25 0 0 0 16.4 19l.85-12.25" />
    </Icon>
  );
}

export function RestoreIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 10.5V5.25M4.5 10.5h5.25" />
      <path d="M5.4 10.4a7.75 7.75 0 1 1-.9 5.35" />
    </Icon>
  );
}

/** Live/updating indicator — a pulse dot rather than a coloured badge. */
export function LiveDot({ active = true }: { active?: boolean }) {
  return (
    <span className="relative inline-flex h-1.5 w-1.5" aria-hidden>
      {active && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
      )}
      <span
        className={`relative inline-flex h-1.5 w-1.5 rounded-full ${
          active ? "bg-accent" : "bg-ink-4"
        }`}
      />
    </span>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2" />
      <path d="m3.75 7 7.13 5.35a1.87 1.87 0 0 0 2.24 0L20.25 7" />
    </Icon>
  );
}

export function KeyIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="7.75" cy="12" r="3.75" />
      <path d="M11.5 12h8.75M17.5 12v3.25M14.75 12v2.5" />
    </Icon>
  );
}

export function ShieldIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5 5 6v5.4c0 4 2.8 7.7 7 9.1 4.2-1.4 7-5.1 7-9.1V6l-7-2.5Z" />
      <path d="m9.25 12 2 2 3.5-3.75" />
    </Icon>
  );
}

/* ─────────────── Football marks ───────────────
   Geometric, not illustrative. Used for section identity only. */

/** Line-icon sibling of the logo: same panel, same five seams. */
export function BallIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="8.7" />
      <path d="M12 7.9 15.67 10.57 14.27 14.88H9.73L8.33 10.57 12 7.9Z" />
      <path d="M12 7.9V3.3M15.67 10.57l4.37-1.42M8.33 10.57 3.96 9.15M14.27 14.88l2.7 3.72M9.73 14.88l-2.7 3.72" />
    </Icon>
  );
}

/** Whistle-free "matchday" mark: a pitch centre circle with halfway line. */
export function PitchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="1.5" />
      <path d="M12 5.25v13.5" />
      <circle cx="12" cy="12" r="2.75" />
    </Icon>
  );
}

/** Rising form line — used for trending sections. */
export function TrendIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m4 15.5 4.5-4.75 3.25 3L19.5 6" />
      <path d="M14.75 6h4.75v4.75" />
    </Icon>
  );
}
