insert into public.countries (name, iso_code) values
  ('England', 'ENG'),
  ('Italy', 'ITA'),
  ('Spain', 'ESP'),
  ('Germany', 'DEU'),
  ('France', 'FRA'),
  ('Turkiye', 'TUR')
on conflict (iso_code) do nothing;

insert into public.leagues (name, slug, country_id, tier)
select 'Premier League', 'premier-league', id, 1 from public.countries where iso_code = 'ENG'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Championship', 'championship', id, 2 from public.countries where iso_code = 'ENG'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Serie A', 'serie-a', id, 1 from public.countries where iso_code = 'ITA'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Serie B', 'serie-b', id, 2 from public.countries where iso_code = 'ITA'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'La Liga', 'la-liga', id, 1 from public.countries where iso_code = 'ESP'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Bundesliga', 'bundesliga', id, 1 from public.countries where iso_code = 'DEU'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Ligue 1', 'ligue-1', id, 1 from public.countries where iso_code = 'FRA'
on conflict (slug) do nothing;
insert into public.leagues (name, slug, country_id, tier)
select 'Super Lig', 'super-lig', id, 1 from public.countries where iso_code = 'TUR'
on conflict (slug) do nothing;

insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Arsenal', 'arsenal', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'premier-league' where c.iso_code = 'ENG'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Leeds United', 'leeds-united', c.id, l.id, 2 from public.countries c join public.leagues l on l.slug = 'championship' where c.iso_code = 'ENG'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Juventus', 'juventus', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'serie-a' where c.iso_code = 'ITA'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Palermo', 'palermo', c.id, l.id, 2 from public.countries c join public.leagues l on l.slug = 'serie-b' where c.iso_code = 'ITA'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Real Madrid', 'real-madrid', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'la-liga' where c.iso_code = 'ESP'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Borussia Dortmund', 'borussia-dortmund', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'bundesliga' where c.iso_code = 'DEU'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Olympique de Marseille', 'olympique-de-marseille', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'ligue-1' where c.iso_code = 'FRA'
on conflict (slug) do nothing;
insert into public.clubs (name, slug, country_id, league_id, tier)
select 'Galatasaray', 'galatasaray', c.id, l.id, 1 from public.countries c join public.leagues l on l.slug = 'super-lig' where c.iso_code = 'TUR'
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
select 1, 0, id from public.titles where slug = 'supporter'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 2, 50, id from public.titles where slug = 'new-writer'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 3, 150, id from public.titles where slug = 'contributor'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 4, 300, id from public.titles where slug = 'writer'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 5, 600, id from public.titles where slug = 'active-writer'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 6, 1000, id from public.titles where slug = 'senior-writer'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 7, 1600, id from public.titles where slug = 'lead-writer'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 8, 2500, id from public.titles where slug = 'community-leader'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 9, 4000, id from public.titles where slug = 'club-voice'
on conflict (level_number) do nothing;
insert into public.levels (level_number, min_xp, title_id)
select 10, 7000, id from public.titles where slug = 'club-legend'
on conflict (level_number) do nothing;

insert into public.badges (name, slug, description, icon) values
  ('First Generation Writer', 'first-generation-writer', 'Placeholder badge for first generation members.', 'FG'),
  ('First Entry', 'first-entry', 'Placeholder badge for a future first entry milestone.', 'FE'),
  ('First Topic', 'first-topic', 'Placeholder badge for a future first topic milestone.', 'FT'),
  ('First Quiz', 'first-quiz', 'Placeholder badge for a future first quiz milestone.', 'FQ'),
  ('Early Member', 'early-member', 'Placeholder badge for early platform members.', 'EM')
on conflict (slug) do nothing;
