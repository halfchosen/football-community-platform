import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { PitchIcon } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <main className="mx-auto grid max-w-md place-items-center gap-4 px-5 py-24 text-center">
      <span
        aria-hidden
        className="grid h-11 w-11 place-items-center rounded-lg bg-sunken text-ink-3 ring-1 ring-line"
      >
        <PitchIcon size={20} />
      </span>
      <div>
        <p className="t-eyebrow">Off the pitch</p>
        <h1 className="mt-2 t-page-title text-ink">This page isn&apos;t here</h1>
        <p className="mt-2 text-[13.5px] leading-6 text-ink-3">
          The link may have changed, or the content is no longer public.
        </p>
      </div>
      <ButtonLink href="/" size="lg">
        Back to the feed
      </ButtonLink>
      <Link
        href="/community"
        className="text-[13px] font-semibold text-ink-3 hover:text-navy"
      >
        How the community works
      </Link>
    </main>
  );
}
