import Link from "next/link";
export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-lg gap-4 px-5 py-20">
      <p className="text-xs font-bold uppercase tracking-widest text-navy">
        Off the pitch
      </p>
      <h1 className="text-3xl font-bold">This page isn’t available.</h1>
      <p className="text-sm leading-7 text-slate-500">
        The link may have changed, or this content is no longer public.
      </p>
      <Link
        href="/"
        className="w-fit rounded-lg bg-navy px-5 py-3 text-sm font-bold text-white"
      >
        Back to the feed
      </Link>
    </main>
  );
}
