"use client";
import Link from "next/link";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto grid max-w-lg gap-4 px-5 py-20">
      <p className="text-xs font-bold uppercase tracking-widest text-navy">
        A brief stoppage
      </p>
      <h1 className="text-3xl font-bold">We couldn’t load this page.</h1>
      <p className="text-sm leading-7 text-slate-500">
        The service may be reconnecting. Your saved account data has not been
        changed.
      </p>
      <button
        onClick={reset}
        className="w-fit rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white"
      >
        Try again
      </button>
      <Link href="/" className="text-sm font-semibold text-navy">
        Back to the feed →
      </Link>
    </main>
  );
}
