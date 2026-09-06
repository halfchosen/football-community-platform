-- Freezing an account also freezes its staff privileges, even with a valid JWT.
create or replace function community_private.is_staff() returns boolean
language sql stable security definer set search_path='' as $$
 select auth.uid() is not null and exists(
  select 1 from community_private.staff_roles r
  join public.community_memberships m on m.user_id=r.user_id
  where r.user_id=auth.uid() and m.state='active'
 )
$$;
create or replace function community_private.configure_wave(p_name text,p_capacity integer,p_club_capacity integer,p_open boolean,p_new boolean) returns void language plpgsql security definer set search_path='' as $$
declare w public.admission_waves;
begin
 if not community_private.is_staff() or not exists(select 1 from community_private.staff_roles where user_id=auth.uid() and role='admin') then raise exception 'Only an administrator can manage admission.' using errcode='42501'; end if;
 if p_capacity not between 1 and 100000 or p_club_capacity not between 1 and 10000 or p_club_capacity>p_capacity then raise exception 'Choose valid community and club capacities.'; end if;
 perform pg_advisory_xact_lock(hashtextextended('community-admission-admin',0));
 select * into w from public.admission_waves order by created_at desc limit 1 for update;
 if p_new then
  if length(trim(p_name)) not between 3 and 60 then raise exception 'Name the new generation (3–60 characters).'; end if;
  update public.admission_waves set is_open=false where is_open;
  insert into public.admission_waves(name,capacity,club_capacity,is_open) values(trim(p_name),p_capacity,p_club_capacity,p_open);
 else
  if p_capacity<w.admitted or exists(select 1 from community_private.admission_counters where wave_id=w.id and admitted>p_club_capacity) then raise exception 'Capacity cannot be lower than places already claimed.'; end if;
  update public.admission_waves set capacity=p_capacity,club_capacity=p_club_capacity,is_open=p_open where id=w.id;
 end if;
 insert into community_private.moderation_log(actor_id,action,reason) values(auth.uid(),'admission','Wave configuration: capacity '||p_capacity||', club capacity '||p_club_capacity||', open '||p_open||', new wave '||p_new);
end $$;
notify pgrst,'reload schema';
