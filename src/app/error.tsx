"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertIcon } from "@/components/ui/icons";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid max-w-md place-items-center gap-4 px-5 py-24 text-center">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-lg bg-warn-wash text-warn ring-1 ring-warn-line"
      >
        <AlertIcon size={20} />
      </span>
      <div>
        <p className="t-eyebrow">A brief stoppage</p>
        <h1 className="mt-2 t-page-title text-ink">We couldn&apos;t load this</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-ink-3">
          The service may be reconnecting. Nothing in your account has changed.
        </p>
      </div>
      <Button onClick={reset} size="lg">
        Try again
      </Button>
      <Link href="/" className="text-[13px] font-semibold text-ink-3 hover:text-navy">
        Back to the feed
      </Link>
    </main>
  );
}
