import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { previewClubs } from "@/app/zzpreview/_mock/data";

// Preview of /onboarding with the local catalog. Submitting requires a real
// session, so nothing can be written from here.
export default function OnboardingPreviewPage() {
  return (
    <main className="mx-auto grid w-full max-w-3xl gap-8 px-4 py-10 sm:px-6 lg:py-14">
      <header className="grid gap-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-violet-700/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-700">
          ⚽ Welcome — let&apos;s set you up
        </span>
        <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">
          Set up your supporter profile
        </h1>
        <p className="max-w-2xl leading-7 text-slate-600">
          Takes about a minute. Choose how you&apos;ll appear to fellow
          supporters — you can fine-tune everything later in your settings.
        </p>
      </header>
      <OnboardingForm clubs={previewClubs} />
    </main>
  );
}
