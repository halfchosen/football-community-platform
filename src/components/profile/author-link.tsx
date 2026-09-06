import Link from "next/link";
import { ClubAvatar } from "@/components/onboarding/club-avatar";

type AuthorLinkProps = {
  username: string;
  displayName?: string | null;
  href?: string;
  size?: "sm" | "md";
  showUsername?: boolean;
  className?: string;
};

export function AuthorLink({
  username,
  displayName,
  href,
  size = "sm",
  showUsername = false,
  className = "",
}: AuthorLinkProps) {
  const authorName = displayName ?? username;

  return (
    <Link
      className={`inline-flex min-w-0 items-center gap-2 rounded-lg outline-none transition hover:text-navy focus-visible:ring-2 focus-visible:ring-navy/30 focus-visible:ring-offset-2 ${className}`}
      href={href ?? `/u/${encodeURIComponent(username)}`}
    >
      <ClubAvatar name={authorName} size={size} />
      <span className="min-w-0 leading-tight">
        <span className="block truncate font-bold">{authorName}</span>
        {showUsername ? (
          <span className="block truncate text-xs font-medium text-slate-400">
            @{username}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
