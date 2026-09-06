import { getAuthenticatedUser } from "@/lib/auth/guards";
import { getProfileByUserId } from "@/lib/db/queries/profiles";
import { isCommunityStaff } from "@/lib/community/queries";
import { CommunityHeader } from "./community-header";
export async function SiteHeader({
  searchAction = "/",
  searchValue = "",
}: { searchAction?: string; searchValue?: string } = {}) {
  const user = await getAuthenticatedUser();
  const [profile, staff] = await Promise.all([
    user ? getProfileByUserId(user.id) : null,
    user ? isCommunityStaff() : false,
  ]);
  return (
    <CommunityHeader
      searchAction={searchAction}
      searchValue={searchValue}
      viewer={
        user
          ? {
              name:
                profile?.display_name ?? profile?.username ?? "Your account",
              profileHref: profile?.onboarding_completed
                ? `/u/${profile.username}`
                : "/onboarding",
              staff,
            }
          : null
      }
    />
  );
}
