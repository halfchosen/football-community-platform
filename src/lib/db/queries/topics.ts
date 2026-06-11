import { createClient } from "@/lib/supabase/server";

export type TopicListItem = {
  id: string;
  topicType: string;
  title: string;
  sourceUrl: string | null;
  sourceDomain: string | null;
  sourceTitle: string | null;
  clubId: string | null;
  clubName: string | null;
  createdAt: string;
  openingEntryId: string | null;
  openingBody: string;
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
  source_url: string | null;
  source_domain: string | null;
  source_title: string | null;
  club_id: string | null;
  club_name: string | null;
  created_at: string;
  opening_entry_id: string | null;
  opening_body: string | null;
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
    sourceUrl: row.source_url,
    sourceDomain: row.source_domain,
    sourceTitle: row.source_title,
    clubId: row.club_id ?? null,
    clubName: row.club_name ?? null,
    createdAt: row.created_at,
    openingEntryId: row.opening_entry_id ?? null,
    openingBody: row.opening_body ?? "",
    authorUsername: row.author_username,
    authorDisplayName: row.author_display_name,
    authorClubName: row.author_club_name,
    authorTitleName: row.author_title_name,
    authorLevel: row.author_level,
  };
}
