import { redirect } from "next/navigation";

// Topic creation is no longer simulated. The real route owns authentication,
// onboarding, eligibility validation, and the Supabase write.
export default function ForumNewPreviewPage() {
  redirect("/forum/new");
}
