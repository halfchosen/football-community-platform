import { createClient } from "@/lib/supabase/server";

export type TopicListItem = {
  id: string;
  topicType: string;
  title: string;
  body: string;
  sourceUrl: string | null;
  sourceDomain: string | null;
  sourceTitle: string | null;
  createdAt: string;
  authorUsername: string;
  authorDisplayName: string | null;
  authorClubName: string | null;
  authorTitleName: string | null;
  authorLevel: number;
};

type TopicRow = {
  id: string;
  topic_type: string;
  title: string;
  body: string;
  source_url: string | null;
  source_domain: string | null;
  source_title: string | null;
  created_at: string;
  author_username: string;
  author_display_name: string | null;
  author_club_name: string | null;
  author_title_name: string | null;
  author_level: number;
};

export async function listRecentTopics(limit = 30): Promise<TopicListItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics_with_author")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as unknown as TopicRow[]).map(mapTopicRow);
}

export async function getTopicById(
  topicId: string,
): Promise<TopicListItem | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("forum_topics_with_author")
    .select("*")
    .eq("id", topicId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapTopicRow(data as unknown as TopicRow);
}

function mapTopicRow(row: TopicRow): TopicListItem {
  return {
    id: row.id,
    topicType: row.topic_type,
    title: row.title,
    body: row.body,
    sourceUrl: row.source_url,
    sourceDomain: row.source_domain,
    sourceTitle: row.source_title,
    createdAt: row.created_at,
    authorUsername: row.author_username,
    authorDisplayName: row.author_display_name,
    authorClubName: row.author_club_name,
    authorTitleName: row.author_title_name,
    authorLevel: row.author_level,
  };
}
