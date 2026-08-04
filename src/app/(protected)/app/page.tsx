import { redirect } from "next/navigation";
import { requireOnboardingComplete } from "@/lib/auth/guards";

// Post-login gate kept for existing auth callbacks and bookmarks. The public
// feed is the signed-in home; incomplete profiles are still sent to onboarding
// by requireOnboardingComplete before this redirect runs.
export default async function AppPage() {
  await requireOnboardingComplete();
  redirect("/");
}
