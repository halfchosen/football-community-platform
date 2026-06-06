import type { Metadata } from "next";
import { ProfileShowcase } from "@/components/design/profile-showcase";

// Design-only preview route for the Sprint 1 profile / football identity module.
// Frontend-only: renders the redesigned UI with static mock data and does not
// touch auth, Supabase, RLS, or the wired application routes.
export const metadata: Metadata = {
  title: "Profile design preview · Football Community",
};

export default function DesignPreviewPage() {
  return <ProfileShowcase />;
}
