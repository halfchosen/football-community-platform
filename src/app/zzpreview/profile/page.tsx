import { PublicProfileCard } from "@/components/profile/public-profile-card";
import { demoProfile } from "@/app/zzpreview/_mock/data";

// Preview of /u/[username] (public supporter profile) with the demo profile.
// The real page's SiteHeader checks the session, so the preview uses a plain
// header to stay fully Supabase-free.
export default function ProfilePreviewPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-violet-100 bg-white/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-4 sm:px-6">
          <span className="inline-flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-700 text-lg text-white">
              ⚽
            </span>
            <span className="text-xl font-bold text-slate-900">
              Football Community
            </span>
          </span>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <PublicProfileCard profile={demoProfile} />
      </main>
    </div>
  );
}
