import { createClient } from "@/lib/supabase/server";
import {
  getLocalClubOptions,
  getLocalLeagueOptions,
} from "@/data/football-leagues";

export type LeagueOption = {
  id: string;
  name: string;
  slug: string;
  countryName: string | null;
  tier: number | null;
};

export type ClubOption = {
  id: string;
  name: string;
  slug: string;
  leagueId: string;
  leagueName: string;
  countryName: string | null;
};

export type NationalTeamOption = {
  id: string;
  name: string;
  slug: string;
  fifaCode: string | null;
  confederation: string | null;
};

export async function getLeagueOptions(): Promise<LeagueOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("leagues")
    .select("id, name, slug, tier, countries(name)")
    .eq("active", true)
    .order("tier", { ascending: true })
    .order("name", { ascending: true });

  if (error || !data) {
    return getLocalLeagueOptions();
  }

  const leagues = data as unknown as LeagueQueryRow[];

  if (leagues.length === 0) {
    return getLocalLeagueOptions();
  }

  return leagues.map((league) => ({
    id: league.id,
    name: league.name,
    slug: league.slug,
    tier: league.tier,
    countryName: league.countries?.name ?? null,
  }));
}

export async function getCurrentClubOptions(): Promise<ClubOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("club_league_memberships")
    .select("leagues(id, name), clubs(id, name, slug, countries(name))")
    .eq("is_current", true)
    .order("season", { ascending: false });

  if (error || !data) {
    return getLocalClubOptions();
  }

  const memberships = (data as unknown as MembershipQueryRow[])
    .filter(hasMembershipRelations)
    .map((membership) => ({
      id: membership.clubs.id,
      name: membership.clubs.name,
      slug: membership.clubs.slug,
      leagueId: membership.leagues.id,
      leagueName: membership.leagues.name,
      countryName: membership.clubs.countries?.name ?? null,
    }))
    .sort((left, right) => left.name.localeCompare(right.name));

  return memberships.length > 0 ? memberships : getLocalClubOptions();
}

export async function getNationalTeamOptions(): Promise<NationalTeamOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("national_teams")
    .select("id, name, slug, fifa_code, confederation")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error || !data) {
    return [];
  }

  const nationalTeams = data as unknown as NationalTeamQueryRow[];

  return nationalTeams.map((team) => ({
    id: team.id,
    name: team.name,
    slug: team.slug,
    fifaCode: team.fifa_code,
    confederation: team.confederation,
  }));
}

type LeagueQueryRow = {
  id: string;
  name: string;
  slug: string;
  tier: number | null;
  countries: { name: string } | null;
};

type MembershipQueryRow = {
  leagues: { id: string; name: string } | null;
  clubs: {
    id: string;
    name: string;
    slug: string;
    countries: { name: string } | null;
  } | null;
};

type NationalTeamQueryRow = {
  id: string;
  name: string;
  slug: string;
  fifa_code: string | null;
  confederation: string | null;
};

type MembershipWithRelations = {
  leagues: { id: string; name: string };
  clubs: {
    id: string;
    name: string;
    slug: string;
    countries: { name: string } | null;
  };
};

function hasMembershipRelations(
  membership: MembershipQueryRow,
): membership is MembershipWithRelations {
  return Boolean(membership.clubs && membership.leagues);
}
