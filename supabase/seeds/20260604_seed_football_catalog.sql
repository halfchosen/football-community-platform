insert into public.countries (name, iso_code) values
  ('Turkiye', 'TUR'),
  ('England', 'ENG'),
  ('Spain', 'ESP'),
  ('Italy', 'ITA'),
  ('Germany', 'DEU'),
  ('France', 'FRA'),
  ('Netherlands', 'NED'),
  ('Portugal', 'PRT'),
  ('Brazil', 'BRA'),
  ('Argentina', 'ARG'),
  ('Japan', 'JPN'),
  ('Morocco', 'MAR'),
  ('United States', 'USA'),
  ('Mexico', 'MEX')
on conflict (iso_code) do nothing;

insert into public.leagues (name, slug, country_id, tier, region)
select league_name, league_slug, c.id, league_tier, league_region
from (
  values
    ('Super Lig', 'super-lig', 'TUR', 1, 'Europe'),
    ('1. Lig', 'turkiye-1-lig', 'TUR', 2, 'Europe'),
    ('Premier League', 'premier-league', 'ENG', 1, 'Europe'),
    ('Championship', 'championship', 'ENG', 2, 'Europe'),
    ('LaLiga', 'laliga', 'ESP', 1, 'Europe'),
    ('Serie A', 'serie-a', 'ITA', 1, 'Europe'),
    ('Bundesliga', 'bundesliga', 'DEU', 1, 'Europe'),
    ('Ligue 1', 'ligue-1', 'FRA', 1, 'Europe'),
    ('Eredivisie', 'eredivisie', 'NED', 1, 'Europe'),
    ('Primeira Liga', 'primeira-liga', 'PRT', 1, 'Europe')
) as leagues(league_name, league_slug, country_code, league_tier, league_region)
join public.countries c on c.iso_code = leagues.country_code
on conflict (slug) do nothing;

insert into public.clubs (name, slug, country_id)
select club_name, club_slug, c.id
from (
  values
    ('Galatasaray', 'galatasaray', 'TUR'),
    ('Fenerbahce', 'fenerbahce', 'TUR'),
    ('Besiktas', 'besiktas', 'TUR'),
    ('Trabzonspor', 'trabzonspor', 'TUR'),
    ('Istanbul Basaksehir', 'istanbul-basaksehir', 'TUR'),
    ('Samsunspor', 'samsunspor', 'TUR'),
    ('Goztepe', 'goztepe', 'TUR'),
    ('Konyaspor', 'konyaspor', 'TUR'),
    ('Antalyaspor', 'antalyaspor', 'TUR'),
    ('Alanyaspor', 'alanyaspor', 'TUR'),
    ('Gaziantep FK', 'gaziantep-fk', 'TUR'),
    ('Kayserispor', 'kayserispor', 'TUR'),
    ('Kasimpasa', 'kasimpasa', 'TUR'),
    ('Rizespor', 'rizespor', 'TUR'),
    ('Eyupspor', 'eyupspor', 'TUR'),
    ('Genclerbirligi', 'genclerbirligi', 'TUR'),
    ('Kocaelispor', 'kocaelispor', 'TUR'),
    ('Fatih Karagumruk', 'fatih-karagumruk', 'TUR'),
    ('Ankaragucu', 'ankaragucu', 'TUR'),
    ('Bandirmaspor', 'bandirmaspor', 'TUR'),
    ('Boluspor', 'boluspor', 'TUR'),
    ('Erzurumspor FK', 'erzurumspor-fk', 'TUR'),
    ('Igdir FK', 'igdir-fk', 'TUR'),
    ('Istanbulspor', 'istanbulspor', 'TUR'),
    ('Keciorengucu', 'keciorengucu', 'TUR'),
    ('Sakaryaspor', 'sakaryaspor', 'TUR'),
    ('Umraniyespor', 'umraniyespor', 'TUR'),
    ('Arsenal', 'arsenal', 'ENG'),
    ('Aston Villa', 'aston-villa', 'ENG'),
    ('Bournemouth', 'bournemouth', 'ENG'),
    ('Brentford', 'brentford', 'ENG'),
    ('Brighton and Hove Albion', 'brighton-and-hove-albion', 'ENG'),
    ('Burnley', 'burnley', 'ENG'),
    ('Chelsea', 'chelsea', 'ENG'),
    ('Crystal Palace', 'crystal-palace', 'ENG'),
    ('Everton', 'everton', 'ENG'),
    ('Fulham', 'fulham', 'ENG'),
    ('Leeds United', 'leeds-united', 'ENG'),
    ('Liverpool', 'liverpool', 'ENG'),
    ('Manchester City', 'manchester-city', 'ENG'),
    ('Manchester United', 'manchester-united', 'ENG'),
    ('Newcastle United', 'newcastle-united', 'ENG'),
    ('Nottingham Forest', 'nottingham-forest', 'ENG'),
    ('Sunderland', 'sunderland', 'ENG'),
    ('Tottenham Hotspur', 'tottenham-hotspur', 'ENG'),
    ('West Ham United', 'west-ham-united', 'ENG'),
    ('Wolverhampton Wanderers', 'wolverhampton-wanderers', 'ENG'),
    ('Blackburn Rovers', 'blackburn-rovers', 'ENG'),
    ('Birmingham City', 'birmingham-city', 'ENG'),
    ('Bristol City', 'bristol-city', 'ENG'),
    ('Charlton Athletic', 'charlton-athletic', 'ENG'),
    ('Coventry City', 'coventry-city', 'ENG'),
    ('Derby County', 'derby-county', 'ENG'),
    ('Hull City', 'hull-city', 'ENG'),
    ('Ipswich Town', 'ipswich-town', 'ENG'),
    ('Leicester City', 'leicester-city', 'ENG'),
    ('Middlesbrough', 'middlesbrough', 'ENG'),
    ('Millwall', 'millwall', 'ENG'),
    ('Norwich City', 'norwich-city', 'ENG'),
    ('Oxford United', 'oxford-united', 'ENG'),
    ('Portsmouth', 'portsmouth', 'ENG'),
    ('Preston North End', 'preston-north-end', 'ENG'),
    ('Queens Park Rangers', 'queens-park-rangers', 'ENG'),
    ('Sheffield United', 'sheffield-united', 'ENG'),
    ('Sheffield Wednesday', 'sheffield-wednesday', 'ENG'),
    ('Southampton', 'southampton', 'ENG'),
    ('Stoke City', 'stoke-city', 'ENG'),
    ('Swansea City', 'swansea-city', 'ENG'),
    ('Watford', 'watford', 'ENG'),
    ('West Bromwich Albion', 'west-bromwich-albion', 'ENG'),
    ('Wrexham', 'wrexham', 'ENG'),
    ('Athletic Club', 'athletic-club', 'ESP'),
    ('Atletico de Madrid', 'atletico-de-madrid', 'ESP'),
    ('CA Osasuna', 'ca-osasuna', 'ESP'),
    ('Celta', 'celta', 'ESP'),
    ('Deportivo Alaves', 'deportivo-alaves', 'ESP'),
    ('Elche CF', 'elche-cf', 'ESP'),
    ('FC Barcelona', 'fc-barcelona', 'ESP'),
    ('Getafe CF', 'getafe-cf', 'ESP'),
    ('Girona FC', 'girona-fc', 'ESP'),
    ('Levante UD', 'levante-ud', 'ESP'),
    ('Rayo Vallecano', 'rayo-vallecano', 'ESP'),
    ('RCD Espanyol de Barcelona', 'rcd-espanyol-de-barcelona', 'ESP'),
    ('RCD Mallorca', 'rcd-mallorca', 'ESP'),
    ('Real Betis', 'real-betis', 'ESP'),
    ('Real Madrid', 'real-madrid', 'ESP'),
    ('Real Oviedo', 'real-oviedo', 'ESP'),
    ('Real Sociedad', 'real-sociedad', 'ESP'),
    ('Sevilla FC', 'sevilla-fc', 'ESP'),
    ('Valencia CF', 'valencia-cf', 'ESP'),
    ('Villarreal CF', 'villarreal-cf', 'ESP'),
    ('Atalanta', 'atalanta', 'ITA'),
    ('Bologna', 'bologna', 'ITA'),
    ('Cagliari', 'cagliari', 'ITA'),
    ('Como', 'como', 'ITA'),
    ('Cremonese', 'cremonese', 'ITA'),
    ('Fiorentina', 'fiorentina', 'ITA'),
    ('Genoa', 'genoa', 'ITA'),
    ('Hellas Verona', 'hellas-verona', 'ITA'),
    ('Inter', 'inter', 'ITA'),
    ('Juventus', 'juventus', 'ITA'),
    ('Lazio', 'lazio', 'ITA'),
    ('Lecce', 'lecce', 'ITA'),
    ('Milan', 'milan', 'ITA'),
    ('Napoli', 'napoli', 'ITA'),
    ('Parma', 'parma', 'ITA'),
    ('Pisa', 'pisa', 'ITA'),
    ('Roma', 'roma', 'ITA'),
    ('Sassuolo', 'sassuolo', 'ITA'),
    ('Torino', 'torino', 'ITA'),
    ('Udinese', 'udinese', 'ITA'),
    ('Bayern Munich', 'bayern-munich', 'DEU'),
    ('Bayer Leverkusen', 'bayer-leverkusen', 'DEU'),
    ('Eintracht Frankfurt', 'eintracht-frankfurt', 'DEU'),
    ('Borussia Dortmund', 'borussia-dortmund', 'DEU'),
    ('Freiburg', 'freiburg', 'DEU'),
    ('Mainz', 'mainz', 'DEU'),
    ('RB Leipzig', 'rb-leipzig', 'DEU'),
    ('Werder Bremen', 'werder-bremen', 'DEU'),
    ('VfB Stuttgart', 'vfb-stuttgart', 'DEU'),
    ('Borussia Monchengladbach', 'borussia-monchengladbach', 'DEU'),
    ('Wolfsburg', 'wolfsburg', 'DEU'),
    ('Augsburg', 'augsburg', 'DEU'),
    ('Union Berlin', 'union-berlin', 'DEU'),
    ('St. Pauli', 'st-pauli', 'DEU'),
    ('Hoffenheim', 'hoffenheim', 'DEU'),
    ('Heidenheim', 'heidenheim', 'DEU'),
    ('Cologne', 'cologne', 'DEU'),
    ('Hamburg', 'hamburg', 'DEU'),
    ('Paris Saint-Germain', 'paris-saint-germain', 'FRA'),
    ('Olympique de Marseille', 'olympique-de-marseille', 'FRA'),
    ('AS Monaco', 'as-monaco', 'FRA'),
    ('OGC Nice', 'ogc-nice', 'FRA'),
    ('Lille OSC', 'lille-osc', 'FRA'),
    ('Olympique Lyonnais', 'olympique-lyonnais', 'FRA'),
    ('RC Strasbourg Alsace', 'rc-strasbourg-alsace', 'FRA'),
    ('RC Lens', 'rc-lens', 'FRA'),
    ('Stade Brestois 29', 'stade-brestois-29', 'FRA'),
    ('Stade Rennais', 'stade-rennais', 'FRA'),
    ('Toulouse FC', 'toulouse-fc', 'FRA'),
    ('AJ Auxerre', 'aj-auxerre', 'FRA'),
    ('Angers SCO', 'angers-sco', 'FRA'),
    ('FC Nantes', 'fc-nantes', 'FRA'),
    ('Le Havre AC', 'le-havre-ac', 'FRA'),
    ('FC Metz', 'fc-metz', 'FRA'),
    ('Paris FC', 'paris-fc', 'FRA'),
    ('FC Lorient', 'fc-lorient', 'FRA'),
    ('Ajax', 'ajax', 'NED'),
    ('PSV', 'psv', 'NED'),
    ('Feyenoord', 'feyenoord', 'NED'),
    ('AZ', 'az', 'NED'),
    ('FC Twente', 'fc-twente', 'NED'),
    ('FC Utrecht', 'fc-utrecht', 'NED'),
    ('SC Heerenveen', 'sc-heerenveen', 'NED'),
    ('FC Groningen', 'fc-groningen', 'NED'),
    ('Sparta Rotterdam', 'sparta-rotterdam', 'NED'),
    ('Fortuna Sittard', 'fortuna-sittard', 'NED'),
    ('PEC Zwolle', 'pec-zwolle', 'NED'),
    ('Heracles Almelo', 'heracles-almelo', 'NED'),
    ('NEC Nijmegen', 'nec-nijmegen', 'NED'),
    ('NAC Breda', 'nac-breda', 'NED'),
    ('Go Ahead Eagles', 'go-ahead-eagles', 'NED'),
    ('Telstar', 'telstar', 'NED'),
    ('FC Volendam', 'fc-volendam', 'NED'),
    ('Excelsior', 'excelsior', 'NED'),
    ('Benfica', 'benfica', 'PRT'),
    ('Porto', 'porto', 'PRT'),
    ('Sporting CP', 'sporting-cp', 'PRT'),
    ('Braga', 'braga', 'PRT'),
    ('Vitoria SC', 'vitoria-sc', 'PRT'),
    ('Santa Clara', 'santa-clara', 'PRT'),
    ('Casa Pia', 'casa-pia', 'PRT'),
    ('Famalicao', 'famalicao', 'PRT'),
    ('Estoril', 'estoril', 'PRT'),
    ('Moreirense', 'moreirense', 'PRT'),
    ('Rio Ave', 'rio-ave', 'PRT'),
    ('Arouca', 'arouca', 'PRT'),
    ('Gil Vicente', 'gil-vicente', 'PRT'),
    ('Nacional', 'nacional', 'PRT'),
    ('AVS', 'avs', 'PRT'),
    ('Alverca', 'alverca', 'PRT'),
    ('Tondela', 'tondela', 'PRT'),
    ('Estrela da Amadora', 'estrela-da-amadora', 'PRT')
) as clubs(club_name, club_slug, country_code)
join public.countries c on c.iso_code = clubs.country_code
on conflict (slug) do nothing;

insert into public.club_league_memberships (club_id, league_id, season, tier, is_current)
select c.id, l.id, '2025-26', memberships.membership_tier, true
from (
  values
    ('super-lig', 1, 'galatasaray'), ('super-lig', 1, 'fenerbahce'), ('super-lig', 1, 'besiktas'), ('super-lig', 1, 'trabzonspor'), ('super-lig', 1, 'istanbul-basaksehir'), ('super-lig', 1, 'samsunspor'), ('super-lig', 1, 'goztepe'), ('super-lig', 1, 'konyaspor'), ('super-lig', 1, 'antalyaspor'), ('super-lig', 1, 'alanyaspor'), ('super-lig', 1, 'gaziantep-fk'), ('super-lig', 1, 'kayserispor'), ('super-lig', 1, 'kasimpasa'), ('super-lig', 1, 'rizespor'), ('super-lig', 1, 'eyupspor'), ('super-lig', 1, 'genclerbirligi'), ('super-lig', 1, 'kocaelispor'), ('super-lig', 1, 'fatih-karagumruk'),
    ('turkiye-1-lig', 2, 'ankaragucu'), ('turkiye-1-lig', 2, 'bandirmaspor'), ('turkiye-1-lig', 2, 'boluspor'), ('turkiye-1-lig', 2, 'erzurumspor-fk'), ('turkiye-1-lig', 2, 'igdir-fk'), ('turkiye-1-lig', 2, 'istanbulspor'), ('turkiye-1-lig', 2, 'keciorengucu'), ('turkiye-1-lig', 2, 'sakaryaspor'), ('turkiye-1-lig', 2, 'umraniyespor'),
    ('premier-league', 1, 'arsenal'), ('premier-league', 1, 'aston-villa'), ('premier-league', 1, 'bournemouth'), ('premier-league', 1, 'brentford'), ('premier-league', 1, 'brighton-and-hove-albion'), ('premier-league', 1, 'burnley'), ('premier-league', 1, 'chelsea'), ('premier-league', 1, 'crystal-palace'), ('premier-league', 1, 'everton'), ('premier-league', 1, 'fulham'), ('premier-league', 1, 'leeds-united'), ('premier-league', 1, 'liverpool'), ('premier-league', 1, 'manchester-city'), ('premier-league', 1, 'manchester-united'), ('premier-league', 1, 'newcastle-united'), ('premier-league', 1, 'nottingham-forest'), ('premier-league', 1, 'sunderland'), ('premier-league', 1, 'tottenham-hotspur'), ('premier-league', 1, 'west-ham-united'), ('premier-league', 1, 'wolverhampton-wanderers'),
    ('championship', 2, 'blackburn-rovers'), ('championship', 2, 'birmingham-city'), ('championship', 2, 'bristol-city'), ('championship', 2, 'charlton-athletic'), ('championship', 2, 'coventry-city'), ('championship', 2, 'derby-county'), ('championship', 2, 'hull-city'), ('championship', 2, 'ipswich-town'), ('championship', 2, 'leicester-city'), ('championship', 2, 'middlesbrough'), ('championship', 2, 'millwall'), ('championship', 2, 'norwich-city'), ('championship', 2, 'oxford-united'), ('championship', 2, 'portsmouth'), ('championship', 2, 'preston-north-end'), ('championship', 2, 'queens-park-rangers'), ('championship', 2, 'sheffield-united'), ('championship', 2, 'sheffield-wednesday'), ('championship', 2, 'southampton'), ('championship', 2, 'stoke-city'), ('championship', 2, 'swansea-city'), ('championship', 2, 'watford'), ('championship', 2, 'west-bromwich-albion'), ('championship', 2, 'wrexham'),
    ('laliga', 1, 'athletic-club'), ('laliga', 1, 'atletico-de-madrid'), ('laliga', 1, 'ca-osasuna'), ('laliga', 1, 'celta'), ('laliga', 1, 'deportivo-alaves'), ('laliga', 1, 'elche-cf'), ('laliga', 1, 'fc-barcelona'), ('laliga', 1, 'getafe-cf'), ('laliga', 1, 'girona-fc'), ('laliga', 1, 'levante-ud'), ('laliga', 1, 'rayo-vallecano'), ('laliga', 1, 'rcd-espanyol-de-barcelona'), ('laliga', 1, 'rcd-mallorca'), ('laliga', 1, 'real-betis'), ('laliga', 1, 'real-madrid'), ('laliga', 1, 'real-oviedo'), ('laliga', 1, 'real-sociedad'), ('laliga', 1, 'sevilla-fc'), ('laliga', 1, 'valencia-cf'), ('laliga', 1, 'villarreal-cf'),
    ('serie-a', 1, 'atalanta'), ('serie-a', 1, 'bologna'), ('serie-a', 1, 'cagliari'), ('serie-a', 1, 'como'), ('serie-a', 1, 'cremonese'), ('serie-a', 1, 'fiorentina'), ('serie-a', 1, 'genoa'), ('serie-a', 1, 'hellas-verona'), ('serie-a', 1, 'inter'), ('serie-a', 1, 'juventus'), ('serie-a', 1, 'lazio'), ('serie-a', 1, 'lecce'), ('serie-a', 1, 'milan'), ('serie-a', 1, 'napoli'), ('serie-a', 1, 'parma'), ('serie-a', 1, 'pisa'), ('serie-a', 1, 'roma'), ('serie-a', 1, 'sassuolo'), ('serie-a', 1, 'torino'), ('serie-a', 1, 'udinese'),
    ('bundesliga', 1, 'bayern-munich'), ('bundesliga', 1, 'bayer-leverkusen'), ('bundesliga', 1, 'eintracht-frankfurt'), ('bundesliga', 1, 'borussia-dortmund'), ('bundesliga', 1, 'freiburg'), ('bundesliga', 1, 'mainz'), ('bundesliga', 1, 'rb-leipzig'), ('bundesliga', 1, 'werder-bremen'), ('bundesliga', 1, 'vfb-stuttgart'), ('bundesliga', 1, 'borussia-monchengladbach'), ('bundesliga', 1, 'wolfsburg'), ('bundesliga', 1, 'augsburg'), ('bundesliga', 1, 'union-berlin'), ('bundesliga', 1, 'st-pauli'), ('bundesliga', 1, 'hoffenheim'), ('bundesliga', 1, 'heidenheim'), ('bundesliga', 1, 'cologne'), ('bundesliga', 1, 'hamburg'),
    ('ligue-1', 1, 'paris-saint-germain'), ('ligue-1', 1, 'olympique-de-marseille'), ('ligue-1', 1, 'as-monaco'), ('ligue-1', 1, 'ogc-nice'), ('ligue-1', 1, 'lille-osc'), ('ligue-1', 1, 'olympique-lyonnais'), ('ligue-1', 1, 'rc-strasbourg-alsace'), ('ligue-1', 1, 'rc-lens'), ('ligue-1', 1, 'stade-brestois-29'), ('ligue-1', 1, 'stade-rennais'), ('ligue-1', 1, 'toulouse-fc'), ('ligue-1', 1, 'aj-auxerre'), ('ligue-1', 1, 'angers-sco'), ('ligue-1', 1, 'fc-nantes'), ('ligue-1', 1, 'le-havre-ac'), ('ligue-1', 1, 'fc-metz'), ('ligue-1', 1, 'paris-fc'), ('ligue-1', 1, 'fc-lorient'),
    ('eredivisie', 1, 'ajax'), ('eredivisie', 1, 'psv'), ('eredivisie', 1, 'feyenoord'), ('eredivisie', 1, 'az'), ('eredivisie', 1, 'fc-twente'), ('eredivisie', 1, 'fc-utrecht'), ('eredivisie', 1, 'sc-heerenveen'), ('eredivisie', 1, 'fc-groningen'), ('eredivisie', 1, 'sparta-rotterdam'), ('eredivisie', 1, 'fortuna-sittard'), ('eredivisie', 1, 'pec-zwolle'), ('eredivisie', 1, 'heracles-almelo'), ('eredivisie', 1, 'nec-nijmegen'), ('eredivisie', 1, 'nac-breda'), ('eredivisie', 1, 'go-ahead-eagles'), ('eredivisie', 1, 'telstar'), ('eredivisie', 1, 'fc-volendam'), ('eredivisie', 1, 'excelsior'),
    ('primeira-liga', 1, 'benfica'), ('primeira-liga', 1, 'porto'), ('primeira-liga', 1, 'sporting-cp'), ('primeira-liga', 1, 'braga'), ('primeira-liga', 1, 'vitoria-sc'), ('primeira-liga', 1, 'santa-clara'), ('primeira-liga', 1, 'casa-pia'), ('primeira-liga', 1, 'famalicao'), ('primeira-liga', 1, 'estoril'), ('primeira-liga', 1, 'moreirense'), ('primeira-liga', 1, 'rio-ave'), ('primeira-liga', 1, 'arouca'), ('primeira-liga', 1, 'gil-vicente'), ('primeira-liga', 1, 'nacional'), ('primeira-liga', 1, 'avs'), ('primeira-liga', 1, 'alverca'), ('primeira-liga', 1, 'tondela'), ('primeira-liga', 1, 'estrela-da-amadora')
) as memberships(league_slug, membership_tier, club_slug)
join public.leagues l on l.slug = memberships.league_slug
join public.clubs c on c.slug = memberships.club_slug
on conflict (club_id, league_id, season) do nothing;

insert into public.national_teams (name, slug, fifa_code, country_id, confederation)
select team_name, team_slug, fifa_code, c.id, confederation
from (
  values
    ('Turkiye', 'turkiye', 'TUR', 'TUR', 'UEFA'),
    ('England', 'england', 'ENG', 'ENG', 'UEFA'),
    ('Spain', 'spain', 'ESP', 'ESP', 'UEFA'),
    ('Italy', 'italy', 'ITA', 'ITA', 'UEFA'),
    ('Germany', 'germany', 'GER', 'DEU', 'UEFA'),
    ('France', 'france', 'FRA', 'FRA', 'UEFA'),
    ('Netherlands', 'netherlands', 'NED', 'NED', 'UEFA'),
    ('Portugal', 'portugal', 'POR', 'PRT', 'UEFA'),
    ('Brazil', 'brazil', 'BRA', 'BRA', 'CONMEBOL'),
    ('Argentina', 'argentina', 'ARG', 'ARG', 'CONMEBOL'),
    ('Japan', 'japan', 'JPN', 'JPN', 'AFC'),
    ('Morocco', 'morocco', 'MAR', 'MAR', 'CAF'),
    ('United States', 'united-states', 'USA', 'USA', 'Concacaf'),
    ('Mexico', 'mexico', 'MEX', 'MEX', 'Concacaf')
) as teams(team_name, team_slug, fifa_code, country_code, confederation)
left join public.countries c on c.iso_code = teams.country_code
on conflict (slug) do nothing;

insert into public.generations (name, slug, description, start_date, is_permanent) values
  ('First Generation Writer', 'first-generation-writer', 'Assigned to users who join during the first public launch period.', '2026-01-01', true)
on conflict (slug) do nothing;

insert into public.titles (name, slug, min_level, sort_order) values
  ('Supporter', 'supporter', 1, 1),
  ('New Writer', 'new-writer', 2, 2),
  ('Contributor', 'contributor', 3, 3),
  ('Writer', 'writer', 4, 4),
  ('Active Writer', 'active-writer', 5, 5),
  ('Senior Writer', 'senior-writer', 6, 6),
  ('Lead Writer', 'lead-writer', 7, 7),
  ('Community Leader', 'community-leader', 8, 8),
  ('Club Voice', 'club-voice', 9, 9),
  ('Club Legend', 'club-legend', 10, 10)
on conflict (slug) do nothing;

insert into public.levels (level_number, min_xp, title_id)
select level_number, min_xp, t.id
from (
  values
    (1, 0, 'supporter'),
    (2, 50, 'new-writer'),
    (3, 150, 'contributor'),
    (4, 300, 'writer'),
    (5, 600, 'active-writer'),
    (6, 1000, 'senior-writer'),
    (7, 1600, 'lead-writer'),
    (8, 2500, 'community-leader'),
    (9, 4000, 'club-voice'),
    (10, 7000, 'club-legend')
) as levels(level_number, min_xp, title_slug)
join public.titles t on t.slug = levels.title_slug
on conflict (level_number) do nothing;

insert into public.badges (name, slug, description, icon) values
  ('First Generation Writer', 'first-generation-writer', 'Placeholder badge for first generation members.', 'FG'),
  ('First Entry', 'first-entry', 'Placeholder badge for a future first entry milestone.', 'FE'),
  ('First Topic', 'first-topic', 'Placeholder badge for a future first topic milestone.', 'FT'),
  ('First Quiz', 'first-quiz', 'Placeholder badge for a future first quiz milestone.', 'FQ'),
  ('Early Member', 'early-member', 'Placeholder badge for early platform members.', 'EM')
on conflict (slug) do nothing;
