import { getLiveTrending } from "@/lib/community/trending";
import { TrendingRail } from "@/components/community/trending-rail";
export async function FeedRail({
  activeTopicId,
}: { activeTopicId?: string } = {}) {
  const trending = await getLiveTrending();
  return <TrendingRail initialItems={trending} activeId={activeTopicId} />;
}
