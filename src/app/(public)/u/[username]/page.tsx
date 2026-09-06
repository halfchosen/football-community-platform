import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { PublicProfileCard } from "@/components/profile/public-profile-card";
import { PublicWriterActivity } from "@/components/profile/public-writer-activity";

import { getPublicProfileByUsername } from "@/lib/db/queries/profiles";

type PublicProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { username } = await params;
  const profile = await getPublicProfileByUsername(username);

  if (!profile) {
    notFound();
  }



  return (
    <div className="flex min-h-full flex-col">
      <SiteHeader />
      <main id="main-content" className="site-width reading-page grid flex-1 gap-7 py-8">
        <PublicProfileCard profile={profile} />
        <PublicWriterActivity username={profile.username} />
      </main>
    </div>
  );
}
