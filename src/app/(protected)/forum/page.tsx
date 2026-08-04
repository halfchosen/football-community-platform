import { redirect } from "next/navigation";

// The global topic list lives on the public feed homepage now.
export default function ForumPage() {
  redirect("/");
}
