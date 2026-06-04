import { createClient } from "@/lib/supabase/server";

export type ClubOption = {
  id: string;
  name: string;
  slug: string;
  leagueName: string | null;
  countryName: string | null;
};

export async function getClubOptions(): Promise<ClubOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clubs")
    .select(
      `
      id,
      name,
      slug,
      leagues(name),
      countries(name)
    `,
    )
    .eq("active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  const clubs = data as unknown as ClubQueryRow[];

  return clubs.map((club) => ({
    id: club.id,
    name: club.name,
    slug: club.slug,
    leagueName: club.leagues?.name ?? null,
    countryName: club.countries?.name ?? null,
  }));
}

type ClubQueryRow = {
  id: string;
  name: string;
  slug: string;
  leagues: { name: string } | null;
  countries: { name: string } | null;
};
