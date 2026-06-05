export type FootballLeague = {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  season: string;
  teams: {
    id: string;
    name: string;
    shortName?: string;
  }[];
};

export const LOCAL_CLUB_ID_PREFIX = "local-club:";
export const LOCAL_LEAGUE_ID_PREFIX = "local-league:";

export const FOOTBALL_LEAGUES: FootballLeague[] = [
  {
    id: "premier-league",
    name: "Premier League",
    country: "England",
    countryCode: "GB-ENG",
    season: "2025-26",
    teams: [
      { id: "arsenal", name: "Arsenal FC", shortName: "Arsenal" },
      { id: "aston-villa", name: "Aston Villa", shortName: "Aston Villa" },
      { id: "bournemouth", name: "AFC Bournemouth", shortName: "Bournemouth" },
      { id: "brentford", name: "Brentford FC", shortName: "Brentford" },
      { id: "brighton", name: "Brighton & Hove Albion", shortName: "Brighton" },
      { id: "burnley", name: "Burnley FC", shortName: "Burnley" },
      { id: "chelsea", name: "Chelsea FC", shortName: "Chelsea" },
      { id: "crystal-palace", name: "Crystal Palace", shortName: "Crystal Palace" },
      { id: "everton", name: "Everton FC", shortName: "Everton" },
      { id: "fulham", name: "Fulham FC", shortName: "Fulham" },
      { id: "leeds-united", name: "Leeds United", shortName: "Leeds" },
      { id: "liverpool", name: "Liverpool FC", shortName: "Liverpool" },
      { id: "manchester-city", name: "Manchester City", shortName: "Man City" },
      { id: "manchester-united", name: "Manchester United", shortName: "Man United" },
      { id: "newcastle-united", name: "Newcastle United", shortName: "Newcastle" },
      { id: "nottingham-forest", name: "Nottingham Forest", shortName: "Forest" },
      { id: "sunderland", name: "Sunderland AFC", shortName: "Sunderland" },
      { id: "tottenham", name: "Tottenham Hotspur", shortName: "Tottenham" },
      { id: "west-ham", name: "West Ham United", shortName: "West Ham" },
      { id: "wolves", name: "Wolverhampton Wanderers", shortName: "Wolves" },
    ],
  },
  {
    id: "la-liga",
    name: "LaLiga EA Sports",
    country: "Spain",
    countryCode: "ES",
    season: "2025-26",
    teams: [
      { id: "athletic-club", name: "Athletic Club", shortName: "Athletic" },
      { id: "atletico-madrid", name: "Atlético de Madrid", shortName: "Atlético" },
      { id: "osasuna", name: "CA Osasuna", shortName: "Osasuna" },
      { id: "celta-vigo", name: "Celta", shortName: "Celta" },
      { id: "deportivo-alaves", name: "Deportivo Alavés", shortName: "Alavés" },
      { id: "elche", name: "Elche CF", shortName: "Elche" },
      { id: "barcelona", name: "FC Barcelona", shortName: "Barcelona" },
      { id: "getafe", name: "Getafe CF", shortName: "Getafe" },
      { id: "girona", name: "Girona FC", shortName: "Girona" },
      { id: "levante", name: "Levante UD", shortName: "Levante" },
      { id: "rayo-vallecano", name: "Rayo Vallecano", shortName: "Rayo" },
      { id: "espanyol", name: "RCD Espanyol de Barcelona", shortName: "Espanyol" },
      { id: "mallorca", name: "RCD Mallorca", shortName: "Mallorca" },
      { id: "real-betis", name: "Real Betis", shortName: "Betis" },
      { id: "real-madrid", name: "Real Madrid", shortName: "Real Madrid" },
      { id: "real-oviedo", name: "Real Oviedo", shortName: "Oviedo" },
      { id: "real-sociedad", name: "Real Sociedad", shortName: "Sociedad" },
      { id: "sevilla", name: "Sevilla FC", shortName: "Sevilla" },
      { id: "valencia", name: "Valencia CF", shortName: "Valencia" },
      { id: "villarreal", name: "Villarreal CF", shortName: "Villarreal" },
    ],
  },
  {
    id: "serie-a",
    name: "Serie A",
    country: "Italy",
    countryCode: "IT",
    season: "2025-26",
    teams: [
      { id: "atalanta", name: "Atalanta", shortName: "Atalanta" },
      { id: "bologna", name: "Bologna", shortName: "Bologna" },
      { id: "cagliari", name: "Cagliari", shortName: "Cagliari" },
      { id: "como", name: "Como", shortName: "Como" },
      { id: "cremonese", name: "Cremonese", shortName: "Cremonese" },
      { id: "fiorentina", name: "Fiorentina", shortName: "Fiorentina" },
      { id: "genoa", name: "Genoa", shortName: "Genoa" },
      { id: "hellas-verona", name: "Hellas Verona", shortName: "Verona" },
      { id: "inter", name: "Inter", shortName: "Inter" },
      { id: "juventus", name: "Juventus", shortName: "Juventus" },
      { id: "lazio", name: "Lazio", shortName: "Lazio" },
      { id: "lecce", name: "Lecce", shortName: "Lecce" },
      { id: "milan", name: "Milan", shortName: "Milan" },
      { id: "napoli", name: "Napoli", shortName: "Napoli" },
      { id: "parma", name: "Parma", shortName: "Parma" },
      { id: "pisa", name: "Pisa", shortName: "Pisa" },
      { id: "roma", name: "Roma", shortName: "Roma" },
      { id: "sassuolo", name: "Sassuolo", shortName: "Sassuolo" },
      { id: "torino", name: "Torino", shortName: "Torino" },
      { id: "udinese", name: "Udinese", shortName: "Udinese" },
    ],
  },
  {
    id: "bundesliga",
    name: "Bundesliga",
    country: "Germany",
    countryCode: "DE",
    season: "2025-26",
    teams: [
      { id: "augsburg", name: "FC Augsburg", shortName: "Augsburg" },
      { id: "bayer-leverkusen", name: "Bayer Leverkusen", shortName: "Leverkusen" },
      { id: "bayern-munich", name: "Bayern Munich", shortName: "Bayern" },
      { id: "borussia-dortmund", name: "Borussia Dortmund", shortName: "Dortmund" },
      { id: "borussia-monchengladbach", name: "Borussia Mönchengladbach", shortName: "M'gladbach" },
      { id: "eintracht-frankfurt", name: "Eintracht Frankfurt", shortName: "Frankfurt" },
      { id: "freiburg", name: "SC Freiburg", shortName: "Freiburg" },
      { id: "hamburg", name: "Hamburger SV", shortName: "Hamburg" },
      { id: "heidenheim", name: "1. FC Heidenheim", shortName: "Heidenheim" },
      { id: "hoffenheim", name: "TSG Hoffenheim", shortName: "Hoffenheim" },
      { id: "koln", name: "1. FC Köln", shortName: "Köln" },
      { id: "mainz", name: "1. FSV Mainz 05", shortName: "Mainz" },
      { id: "rb-leipzig", name: "RB Leipzig", shortName: "Leipzig" },
      { id: "st-pauli", name: "FC St. Pauli", shortName: "St. Pauli" },
      { id: "union-berlin", name: "1. FC Union Berlin", shortName: "Union Berlin" },
      { id: "vfb-stuttgart", name: "VfB Stuttgart", shortName: "Stuttgart" },
      { id: "werder-bremen", name: "Werder Bremen", shortName: "Bremen" },
      { id: "wolfsburg", name: "VfL Wolfsburg", shortName: "Wolfsburg" },
    ],
  },
  {
    id: "ligue-1",
    name: "Ligue 1",
    country: "France",
    countryCode: "FR",
    season: "2025-26",
    teams: [
      { id: "angers", name: "Angers SCO", shortName: "Angers" },
      { id: "auxerre", name: "AJ Auxerre", shortName: "Auxerre" },
      { id: "monaco", name: "AS Monaco", shortName: "Monaco" },
      { id: "brest", name: "Stade Brestois 29", shortName: "Brest" },
      { id: "lorient", name: "FC Lorient", shortName: "Lorient" },
      { id: "metz", name: "FC Metz", shortName: "Metz" },
      { id: "nantes", name: "FC Nantes", shortName: "Nantes" },
      { id: "le-havre", name: "Le Havre AC", shortName: "Le Havre" },
      { id: "lille", name: "LOSC Lille", shortName: "Lille" },
      { id: "nice", name: "OGC Nice", shortName: "Nice" },
      { id: "lyon", name: "Olympique Lyonnais", shortName: "Lyon" },
      { id: "marseille", name: "Olympique de Marseille", shortName: "Marseille" },
      { id: "paris-fc", name: "Paris FC", shortName: "Paris FC" },
      { id: "psg", name: "Paris Saint-Germain", shortName: "PSG" },
      { id: "lens", name: "RC Lens", shortName: "Lens" },
      { id: "rennes", name: "Stade Rennais FC", shortName: "Rennes" },
      { id: "strasbourg", name: "RC Strasbourg Alsace", shortName: "Strasbourg" },
      { id: "toulouse", name: "Toulouse FC", shortName: "Toulouse" },
    ],
  },
  {
    id: "super-lig",
    name: "Trendyol Süper Lig",
    country: "Türkiye",
    countryCode: "TR",
    season: "2025-26",
    teams: [
      { id: "alanyaspor", name: "Alanyaspor", shortName: "Alanyaspor" },
      { id: "antalyaspor", name: "Antalyaspor", shortName: "Antalyaspor" },
      { id: "basaksehir", name: "İstanbul Başakşehir", shortName: "Başakşehir" },
      { id: "besiktas", name: "Beşiktaş", shortName: "Beşiktaş" },
      { id: "eyupspor", name: "Eyüpspor", shortName: "Eyüpspor" },
      { id: "fatih-karagumruk", name: "Fatih Karagümrük", shortName: "Karagümrük" },
      { id: "fenerbahce", name: "Fenerbahçe", shortName: "Fenerbahçe" },
      { id: "galatasaray", name: "Galatasaray", shortName: "Galatasaray" },
      { id: "gaziantep", name: "Gaziantep FK", shortName: "Gaziantep" },
      { id: "genclerbirligi", name: "Gençlerbirliği", shortName: "Gençlerbirliği" },
      { id: "goztepe", name: "Göztepe", shortName: "Göztepe" },
      { id: "kasimpasa", name: "Kasımpaşa", shortName: "Kasımpaşa" },
      { id: "kayserispor", name: "Kayserispor", shortName: "Kayserispor" },
      { id: "kocaelispor", name: "Kocaelispor", shortName: "Kocaelispor" },
      { id: "konyaspor", name: "Konyaspor", shortName: "Konyaspor" },
      { id: "rizespor", name: "Çaykur Rizespor", shortName: "Rizespor" },
      { id: "samsunspor", name: "Samsunspor", shortName: "Samsunspor" },
      { id: "trabzonspor", name: "Trabzonspor", shortName: "Trabzonspor" },
    ],
  },
];

export function getLocalLeagueOptions() {
  return FOOTBALL_LEAGUES.map((league) => ({
    id: `${LOCAL_LEAGUE_ID_PREFIX}${league.id}`,
    name: league.name,
    slug: league.id,
    countryName: league.country,
    tier: null,
  }));
}

export function getLocalClubOptions() {
  return FOOTBALL_LEAGUES.flatMap((league) =>
    league.teams.map((team) => ({
      id: `${LOCAL_CLUB_ID_PREFIX}${league.id}:${team.id}`,
      name: team.name,
      slug: team.id,
      leagueId: `${LOCAL_LEAGUE_ID_PREFIX}${league.id}`,
      leagueName: league.name,
      countryName: league.country,
    })),
  ).sort((left, right) => left.name.localeCompare(right.name));
}

export function getLocalClubName(localClubId: string) {
  const payload = localClubId.replace(LOCAL_CLUB_ID_PREFIX, "");
  const [leagueId, teamId] = payload.split(":");
  const league = FOOTBALL_LEAGUES.find((item) => item.id === leagueId);
  const team = league?.teams.find((item) => item.id === teamId);

  return team?.name ?? null;
}
