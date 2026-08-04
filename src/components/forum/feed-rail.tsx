import { getTrendingTopics } from "@/lib/db/queries/feed";
import { TopicSidebar } from "@/components/forum/topic-sidebar";

// Shared left rail. Keeping one purpose here makes Trending a primary topic
// index instead of a small secondary widget competing with the feed.
export async function FeedRail() {
  const trending = await getTrendingTopics(20);

  return <TopicSidebar items={trending} variant="rail" />;
}
