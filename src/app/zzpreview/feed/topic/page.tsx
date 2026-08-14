import { redirect } from "next/navigation";

// Compatibility route for the former standalone preview. The feed now owns
// the complete topic/post interaction.
export default function FeedTopicPreviewPage() {
  redirect("/zzpreview/feed?topic=preview-sourced");
}
