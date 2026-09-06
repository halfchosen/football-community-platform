import { createClient } from "@/lib/supabase/server";
import type { SidebarTopicItem } from "@/components/forum/topic-sidebar";
export async function getLiveTrending(): Promise<SidebarTopicItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("community_trending", {
    p_limit: 20,
  });
  if (error) throw new Error("Trending is temporarily unavailable.");
  return (
    (data ?? []) as {
      id: string;
      title: string;
      posts: number;
      writers: number;
    }[]
  ).map((row) => ({
    id: row.id,
    title: row.title,
    contributionCount: Number(row.posts),
    ratingCount: 0,
    ratingAverage: 0,
    writerCount: Number(row.writers),
  }));
}
