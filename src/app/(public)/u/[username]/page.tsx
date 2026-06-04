import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { PublicProfileCard } from "@/components/profile/public-profile-card";
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
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6">
        <PublicProfileCard profile={profile} />
      </main>
    </div>
  );
}
