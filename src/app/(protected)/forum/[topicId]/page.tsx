import { redirect } from "next/navigation";

type TopicPageProps = {
  params: Promise<{ topicId: string }>;
};

// Compatibility route for bookmarks and shared links. Community reading and
// writing now live on the single feed surface, with the requested topic open.
export default async function TopicPage({ params }: TopicPageProps) {
  const { topicId } = await params;

  redirect(`/?topic=${encodeURIComponent(topicId)}`);
}
