import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { readdir, readFile } from "node:fs/promises";
import assert from "node:assert/strict";

const db = new PGlite({ extensions: { pgcrypto } });
const ids = Object.fromEntries(
  ["home", "away", "follower", "other", "waiter", "unverified", "staff"].map(
    (key, i) => [
      key,
      `10000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    ],
  ),
);
const clubs = {
  home: "20000000-0000-4000-8000-000000000001",
  away: "20000000-0000-4000-8000-000000000002",
};
let checks = 0;
async function query(sql, args = []) {
  return (await db.query(sql, args)).rows;
}
async function asUser(name, fn) {
  await db.exec(
    `set role authenticated; select set_config('request.jwt.claim.sub','${ids[name]}',false); select set_config('request.jwt.claim.role','authenticated',false);`,
  );
  try {
    return await fn();
  } finally {
    await db.exec(
      "reset role; select set_config('request.jwt.claim.sub','',false); select set_config('request.jwt.claim.role','',false);",
    );
  }
}
async function denied(fn, pattern) {
  await assert.rejects(fn, pattern);
  checks++;
}
function equal(actual, expected, label) {
  assert.deepEqual(actual, expected, label);
  checks++;
}
async function cool(name) {
  await query(
    "update community_private.quota_events set created_at=now()-interval '1 minute' where user_id=$1 and created_at>now()-interval '1 minute'",
    [ids[name]],
  );
}
async function join(name, club = clubs.home, follow = []) {
  return asUser(name, async () =>
    query("select public.save_community_identity($1::jsonb,true) state", [
      JSON.stringify({
        username: `test_${name}`,
        primaryClubId: club,
        secondaryClubIds: follow,
        preferredLanguage: "en",
        is18PlusConfirmed: true,
        termsVersion: "2026-09-05",
        privacyVersion: "2026-09-05",
        rulesVersion: "2026-09-05",
      }),
    ]),
  );
}
async function topic(name, club = clubs.home) {
  await cool(name);
  return asUser(
    name,
    async () =>
      (
        await query(
          "select public.create_forum_topic('general','A proper football debate','Here is an original opening take for this football discussion.',null,null,$1,null) id",
          [club],
        )
      )[0].id,
  );
}
async function post(
  name,
  topicId,
  body = "A new football take worth discussing.",
) {
  await cool(name);
  return asUser(
    name,
    async () =>
      (
        await query(
          "insert into public.forum_entries(topic_id,author_id,body) values($1,$2,$3) returning id",
          [topicId, ids[name], body],
        )
      )[0].id,
  );
}
async function reply(name, topicId, entryId, parent = null) {
  await cool(name);
  return asUser(
    name,
    async () =>
      (
        await query(
          "insert into public.forum_comments(topic_id,entry_id,author_id,body,reply_to_comment_id) values($1,$2,$3,$4,$5) returning id",
          [
            topicId,
            entryId,
            ids[name],
            "A reply with a different point of view.",
            parent,
          ],
        )
      )[0].id,
  );
}
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls; create schema auth;
 create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,last_sign_in_at timestamptz);
 create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
 grant usage on schema auth,public to anon,authenticated,service_role;
 alter default privileges in schema public grant all on tables to anon,authenticated,service_role;
 alter default privileges in schema public grant all on sequences to anon,authenticated,service_role;`);
  for (const file of (await readdir("supabase/migrations"))
    .filter((f) => f.endsWith(".sql"))
    .sort()) {
    if (file.includes("retention_schedule")) continue;
    try {
      await db.exec(await readFile(`supabase/migrations/${file}`, "utf8"));
    } catch (error) {
      throw new Error(
        `Migration ${file}: ${error.message} (position ${error.position ?? "unknown"})`,
      );
    }
  }
  console.log("All application migrations applied to isolated PostgreSQL.");
  for (const [name, id] of Object.entries(ids))
    await query(
      "insert into auth.users values($1,$2,case when $3 then null else now() end,now())",
      [id, `${name}@example.invalid`, name === "unverified"],
    );
  await query(
    "insert into public.clubs(id,name,slug) values($1,'Home FC','home-fc'),($2,'Away FC','away-fc')",
    [clubs.home, clubs.away],
  );
  await denied(() => join("home"), /launch policies/);
  await query(
    "update community_private.launch_settings set policies_published=true",
  );
  equal((await join("home"))[0].state, "active", "verified member admitted");
  equal(
    (await join("away", clubs.away))[0].state,
    "active",
    "away member admitted",
  );
  equal(
    (await join("follower", clubs.away, [clubs.home]))[0].state,
    "active",
    "follower admitted",
  );
  equal((await join("other"))[0].state, "active", "another home writer");
  equal((await join("staff"))[0].state, "active", "staff normal membership");
  await query(
    "insert into community_private.staff_roles(user_id,role) values($1,'admin')",
    [ids.staff],
  );
  await denied(() => join("unverified"), /Verify your email/);
  await asUser("home", () =>
    denied(
      () =>
        query("update public.user_profiles set xp=999 where id=$1", [ids.home]),
      /permission denied/,
    ),
  );
  await asUser("home", () =>
    denied(
      () =>
        query(
          "update public.community_memberships set writer_status='Club Captain' where user_id=$1",
          [ids.home],
        ),
      /permission denied/,
    ),
  );
  const t = await topic("home");
  const opener = (
    await query(
      "select id from public.forum_entries where topic_id=$1 and is_opening",
      [t],
    )
  )[0].id;
  await denied(() => topic("away"), /club_permission/);
  await denied(() => post("home", t), /post_spacing/);
  await post("away", t);
  await post("other", t);
  const homePost = await post("home", t, "PRIVATE DELETION TEST BODY");
  const t2 = await topic("follower");
  await denied(() => post("away", t2), /away_post_limit/);
  const r1 = await reply("away", t, opener);
  const r2 = await reply("away", t, opener, r1);
  await reply(
    "away",
    t2,
    (
      await query(
        "select id from public.forum_entries where topic_id=$1 and is_opening",
        [t2],
      )
    )[0].id,
  );
  await denied(() => reply("away", t, opener), /away_reply_limit/);
  await denied(
    async () =>
      reply(
        "other",
        t2,
        (
          await query(
            "select id from public.forum_entries where topic_id=$1 and is_opening",
            [t2],
          )
        )[0].id,
        r1,
      ),
    /content_unavailable/,
  );
  equal(
    (
      await query(
        "select reply_to_comment_id from public.forum_comments where id=$1",
        [r2],
      )
    )[0].reply_to_comment_id,
    r1,
    "reply context retained in one lane",
  );
  await asUser("home", () =>
    denied(
      () =>
        query(
          "insert into public.forum_ratings(user_id,target_type,target_id,score) values($1,'entry',$2,10)",
          [ids.home, opener],
        ),
      /self_rating/,
    ),
  );
  await asUser("away", () =>
    query(
      "insert into public.forum_ratings(user_id,target_type,target_id,score) values($1,'entry',$2,7) on conflict(user_id,target_type,target_id) do update set score=excluded.score",
      [ids.away, opener],
    ),
  );
  await asUser("away", () =>
    query(
      "insert into public.forum_ratings(user_id,target_type,target_id,score) values($1,'entry',$2,8) on conflict(user_id,target_type,target_id) do update set score=excluded.score",
      [ids.away, opener],
    ),
  );
  equal(
    Number(
      (
        await query(
          "select count(*) n from community_private.quota_events where user_id=$1 and kind='rating'",
          [ids.away],
        )
      )[0].n,
    ),
    1,
    "changing a rating does not charge twice",
  );
  await asUser("away", () =>
    denied(
      () =>
        query("select public.manage_community_content('entry',$1,'delete')", [
          homePost,
        ]),
      /permission denied/,
    ),
  );
  await asUser("home", () =>
    query("select public.manage_community_content('entry',$1,'delete')", [
      homePost,
    ]),
  );
  await db.exec("set role anon");
  equal(
    (
      await query("select body from public.forum_entries where id=$1", [
        homePost,
      ])
    )[0].body,
    "[Deleted post]",
    "raw REST row contains no deleted text",
  );
  await denied(
    () => query("select body from community_private.recycle_bin"),
    /permission denied/,
  );
  await db.exec("reset role");
  const bin = await asUser("home", () =>
    query("select public.community_own_activity(true,0) items"),
  );
  equal(
    bin[0].items.some((item) => item.body === "PRIVATE DELETION TEST BODY"),
    true,
    "owner recovery view contains text",
  );
  await asUser("home", () =>
    query("select public.manage_community_content('entry',$1,'restore')", [
      homePost,
    ]),
  );
  equal(
    (
      await query("select body from public.forum_entries where id=$1", [
        homePost,
      ])
    )[0].body,
    "PRIVATE DELETION TEST BODY",
    "restore works",
  );
  const report = await asUser(
    "other",
    async () =>
      (
        await query(
          "select public.report_community_content('entry',$1,'abuse','Please review the context of this post.') id",
          [homePost],
        )
      )[0].id,
  );
  await asUser("other", () =>
    denied(
      () =>
        query(
          "select public.report_community_content('entry',$1,'abuse','Repeated report of the same post.')",
          [homePost],
        ),
      /already_reported/,
    ),
  );
  await asUser("away", () =>
    denied(
      () => query("select public.community_moderation_queue()"),
      /permission denied/,
    ),
  );
  const hiddenChild = await reply("other", t, homePost);
  await asUser("staff", () =>
    query(
      "select public.resolve_community_report($1,'hide','This post violates the community rules.')",
      [report],
    ),
  );
  await db.exec("set role anon");
  equal(
    (
      await query("select body from public.forum_entries where id=$1", [
        homePost,
      ])
    ).length,
    0,
    "moderation hides raw row",
  );
  equal(
    (
      await query("select id from public.forum_comments where id=$1", [
        hiddenChild,
      ])
    ).length,
    0,
    "hidden parent hides replies at REST boundary",
  );
  await db.exec("reset role");
  await asUser("other", () =>
    query(
      "select public.appeal_community_report($1,'Please reconsider with the complete context.')",
      [report],
    ),
  );
  // Deletion during a review must not let an appealed decision be bypassed.
  await query("update public.forum_entries set status='deleted' where id=$1", [
    homePost,
  ]);
  await query(
    "insert into community_private.recycle_bin(kind,target_id,user_id,body,origin) values('entry',$1,$2,'PRIVATE DELETION TEST BODY','owner')",
    [homePost, ids.home],
  );
  await asUser("home", () =>
    denied(
      () =>
        query("select public.manage_community_content('entry',$1,'restore')", [
          homePost,
        ]),
      /under review/,
    ),
  );
  await query("delete from community_private.recycle_bin where target_id=$1", [
    homePost,
  ]);
  await query("update public.forum_entries set status='hidden' where id=$1", [
    homePost,
  ]);
  await asUser("staff", () =>
    denied(
      () =>
        query(
          "select public.resolve_community_report($1,null,'Missing action should be rejected')",
          [report],
        ),
      /decision reason/,
    ),
  );
  await asUser("staff", () =>
    query(
      "select public.resolve_community_report($1,'restore','The additional context supports restoration.')",
      [report],
    ),
  );
  await asUser("home", () =>
    query("select public.community_account_lifecycle('delete')"),
  );
  equal(
    (
      await query(
        "select state from public.community_memberships where user_id=$1",
        [ids.home],
      )
    )[0].state,
    "frozen",
    "account freezes",
  );
  await denied(() => post("home", t2), /membership_inactive/);
  await asUser("home", () =>
    query("select public.community_account_lifecycle('recover')"),
  );
  equal(
    (
      await query(
        "select state from public.community_memberships where user_id=$1",
        [ids.home],
      )
    )[0].state,
    "active",
    "recovery works",
  );
  equal(
    (
      await query("select body from public.forum_entries where id=$1", [
        homePost,
      ])
    )[0].body,
    "PRIVATE DELETION TEST BODY",
    "account recovery restores its posts",
  );
  await asUser("home", () =>
    query("select public.manage_community_content('entry',$1,'delete')", [
      homePost,
    ]),
  );
  await query(
    "update community_private.recycle_bin set expires_at=now()-interval '1 day' where target_id=$1",
    [homePost],
  );
  await asUser("home", () =>
    denied(
      () =>
        query("select public.manage_community_content('entry',$1,'restore')", [
          homePost,
        ]),
      /restore_expired/,
    ),
  );
  await query("select community_private.retention_cleanup()");
  equal(
    Number(
      (
        await query(
          "select count(*) n from community_private.recycle_bin where target_id=$1",
          [homePost],
        )
      )[0].n,
    ),
    0,
    "expired text purged",
  );
  await query(
    "update public.community_memberships set state='suspended' where user_id=$1",
    [ids.other],
  );
  await asUser("other", () =>
    query("select public.community_account_lifecycle('delete')"),
  );
  await asUser("other", () =>
    query("select public.community_account_lifecycle('recover')"),
  );
  equal(
    (
      await query(
        "select state from public.community_memberships where user_id=$1",
        [ids.other],
      )
    )[0].state,
    "suspended",
    "recovery cannot bypass suspension",
  );
  await query("update public.admission_waves set club_capacity=2");
  equal(
    (await join("waiter"))[0].state,
    "waitlisted",
    "full club is waitlisted",
  );
  await asUser("waiter", () =>
    denied(
      () =>
        query(
          "insert into public.forum_entries(topic_id,author_id,body) values($1,$2,'Cannot bypass the waiting list')",
          [t, ids.waiter],
        ),
      /membership_inactive|row-level security/,
    ),
  );
  await asUser("home", () =>
    query("select public.community_account_lifecycle('erase')"),
  );
  const due = (
    await query("select community_private.retention_cleanup() ids")
  )[0].ids;
  equal(due.includes(ids.home), true, "auth cleanup receives only due account");
  equal(
    (
      await query("select display_name from public.user_profiles where id=$1", [
        ids.home,
      ])
    )[0].display_name,
    "Deleted user",
    "profile scrubbed before Auth cleanup",
  );
  equal(
    (
      await query("select body from public.forum_entries where id=$1", [opener])
    )[0].body,
    "[Deleted post]",
    "account erasure scrubs original content",
  );
  equal(
    (
      await query(
        "select seat_number from public.community_memberships where user_id=$1",
        [ids.home],
      )
    )[0].seat_number,
    1,
    "founding number not recycled",
  );
  await asUser("unverified", () =>
    query("select public.community_account_lifecycle('erase')"),
  );
  equal(
    (
      await query("select community_private.retention_cleanup() ids")
    )[0].ids.includes(ids.unverified),
    true,
    "unfinished Auth account can request erasure",
  );
  await asUser("away", () =>
    denied(
      () =>
        query(
          "select public.community_manage_member($1,'captain','Attempted unprivileged assignment')",
          [ids.follower],
        ),
      /permission denied/,
    ),
  );
  await asUser("staff", () =>
    query(
      "select public.community_manage_member($1,'captain','Recognised for consistent contributions')",
      [ids.follower],
    ),
  );
  equal(
    (
      await query(
        "select writer_status from public.community_memberships where user_id=$1",
        [ids.follower],
      )
    )[0].writer_status,
    "Club Captain",
    "admin can assign reviewed distinction",
  );
  await asUser("staff", () =>
    denied(
      () => query("select public.community_configure_wave('',1,1,true,false)"),
      /Capacity cannot/,
    ),
  );
  const oldWave = (
    await query(
      "select wave_id from public.community_memberships where user_id=$1",
      [ids.follower],
    )
  )[0].wave_id;
  await asUser("staff", () =>
    query(
      "select public.community_configure_wave('Second Generation',100,10,true,true)",
    ),
  );
  equal(
    (
      await query(
        "select wave_id from public.community_memberships where user_id=$1",
        [ids.follower],
      )
    )[0].wave_id,
    oldWave,
    "new wave does not rewrite earlier generations",
  );
  equal(
    (await join("waiter"))[0].state,
    "active",
    "waitlisted member can claim a place in a new wave",
  );
  await asUser("away", () =>
    denied(
      () =>
        query("select public.community_configure_wave('',100,10,true,false)"),
      /administrator/,
    ),
  );
  await asUser("staff", () =>
    denied(
      () =>
        query(
          "select public.community_manage_member($1,null,'A reason without a valid action')",
          [ids.follower],
        ),
      /valid action/,
    ),
  );
  const pagedTopic = await topic("waiter");
  const pagedOpening = (
    await query(
      "select id from public.forum_entries where topic_id=$1 and is_opening",
      [pagedTopic],
    )
  )[0].id;
  // Bulk fixtures bypass triggers only in this disposable in-memory database.
  await db.exec("set session_replication_role=replica");
  await query(
    "insert into public.forum_entries(topic_id,author_id,body,created_at) select $1,$2,'Pagination fixture '||n,now()+n*interval '1 second' from generate_series(1,40) n",
    [pagedTopic, ids.follower],
  );
  await query(
    "insert into public.forum_comments(topic_id,entry_id,author_id,body,created_at) select $1,$2,$3,'Reply pagination fixture '||n,now()+n*interval '1 second' from generate_series(1,45) n",
    [pagedTopic, pagedOpening, ids.follower],
  );
  await db.exec("set session_replication_role=origin; set role anon");
  const firstPage = (
    await query("select public.community_post_page($1,0) rows", [pagedTopic])
  )[0].rows;
  const secondPage = (
    await query("select public.community_post_page($1,30) rows", [pagedTopic])
  )[0].rows;
  equal(firstPage.length, 30, "stream first page is bounded");
  equal(secondPage.length, 11, "stream later page contains remaining posts");
  equal(
    new Set([...firstPage, ...secondPage].map((row) => row.id)).size,
    41,
    "stable pages contain no duplicate or missing posts",
  );
  equal(firstPage[0].replies.length, 10, "initial reply lane is bounded");
  equal(firstPage[0].reply_count, 45, "reply total includes later pages");
  equal(
    (
      await query(
        "select id from public.forum_comments_with_author where entry_id=$1 order by created_at,id offset 10 limit 20",
        [pagedOpening],
      )
    ).length,
    20,
    "reply continuation is accessible through public RLS",
  );
  await db.exec("reset role");
  await asUser("staff", () =>
    query("select public.community_account_lifecycle('delete')"),
  );
  await asUser("staff", () =>
    denied(
      () => query("select public.community_moderation_queue()"),
      /permission denied/,
    ),
  );
  await asUser("staff", () =>
    denied(
      () =>
        query("select public.community_configure_wave('',100,10,true,false)"),
      /administrator/,
    ),
  );
  await asUser("staff", () =>
    query("select public.community_account_lifecycle('recover')"),
  );
  equal(
    (
      await asUser("staff", () =>
        query("select community_private.is_staff() allowed"),
      )
    )[0].allowed,
    true,
    "recovered active staff can resume review",
  );
  console.log(
    `Community database checks passed (${checks} assertions). No remote data was used or changed.`,
  );
} catch (error) {
  console.error(error.message);
  if (error.stack)
    console.error(error.stack.split("\n").slice(1, 4).join("\n"));
  process.exitCode = 1;
} finally {
  await db.close();
}
