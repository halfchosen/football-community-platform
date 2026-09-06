import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/layout/site-header";
import { COMMUNITY_POLICY } from "@/domains/community/policy";
import {
  getCommunityOperator,
  isCommunityLaunchReady,
} from "@/lib/community/legal";
const documents: Record<
  string,
  { title: string; intro: string; sections: [string, string][] }
> = {
  terms: {
    title: "Terms of Use",
    intro:
      "A place for football supporters to share takes, disagree, and enjoy the game together.",
    sections: [
      [
        "Joining the community",
        "You must be at least 18 and use an email address you control. Verify your email, choose your football identity, and accept these terms and the Community Rules. Admission is limited by generation and club capacity. An account does not guarantee an available writer place. Do not create accounts to evade limits or a suspension.",
      ],
      [
        "Your identity and place",
        "Your FAN club determines where you can start club topics, alongside your followed clubs. Your admission club and founding place are fixed. Contact the team for a genuine correction. Followed clubs can change once every 21 days. A generation records when you joined; writer status is separate and can change. Founding numbers are not reused.",
      ],
      [
        "Your words",
        "You keep ownership of the content you create. You give us a non-exclusive permission to host, display, and technically process it to operate this community while it is available here. Share only material you are entitled to use. Link to reporting instead of copying entire articles. Other members can reply to and rate public posts. Never post passwords, private contact details, or someone else's personal information.",
      ],
      [
        "Fair participation",
        "Limits apply to topics, posts, replies, and ratings. They reset at midnight UTC. Deleted content still counts toward a daily limit. Do not automate engagement, manipulate ratings, impersonate people, or coordinate abuse. A rating describes a football take, not the worth of its writer. We may adjust limits with notice in the Community Rules.",
      ],
      [
        "Removing content and accounts",
        "Deleted post text is removed from public display immediately. A private copy is recoverable for 30 days, unless you choose permanent erasure earlier. Conversation placeholders can remain so other members' replies still make sense. Account deletion freezes participation and hides your content during an optional 30-day recovery period. You can request immediate erasure instead. A specific legal obligation or documented legal claim may require restricted retention for a defined period.",
      ],
      [
        "Reports, decisions, and appeals",
        "Use Report on a post to explain a concern. The team reviews context and records a reason for any restriction. You can see your report's outcome in your account and submit an appeal within 180 days of a decision. Report counts alone do not determine removal. For urgent privacy, rights-holder, or legal requests, use the contact below and include the exact content URL and your reasons.",
      ],
      [
        "Availability and changes",
        "The community may be interrupted for maintenance or security work. We do not promise that member posts are accurate or that external sources remain available. Material changes to these terms require a new acknowledgement before further participation. Nothing here excludes mandatory consumer or data-protection rights under applicable law.",
      ],
      [
        "Independent community",
        "We are an independent fan community. Club and competition names identify the subjects discussed; they do not imply affiliation, sponsorship, or endorsement. Logos are displayed only where the necessary permissions have been recorded.",
      ],
    ],
  },
  privacy: {
    title: "Privacy Notice",
    intro: "Football identity in public. Account details in private.",
    sections: [
      [
        "What we collect",
        "Account email and authentication information are handled by Supabase Auth. The app stores your username, optional display name, club choices, language preference, 18+ confirmation, generation, writer status, agreement receipts, posts, replies, ratings, saved topics, reports, and notifications. We do not ask for your exact birthdate. Google sign-in, when enabled, supplies account identity through Google; your private email is not added to your public profile.",
      ],
      [
        "Why we use it",
        "Account and content data operate the service you request. Agreement receipts demonstrate acceptance of the community contract. Security limits and report handling protect members and service integrity. We assess legitimate interests and legal obligations where relevant; essential service processing is not presented as optional marketing consent. We do not sell personal data or award status for passive reading or time spent with a tab open.",
      ],
      [
        "What others see",
        "Your username, display name, football identity, registration year, generation, founding place, writer status, and published content are public. Ratings are shown as aggregates; individual scores are private to their owner. Saved topics, account email, notification preferences, and deletion recovery copies are private. A reporter's identity is not shared with the reported writer.",
      ],
      [
        "Cookies and service providers",
        "Essential authentication cookies keep you signed in and protect sessions. CAPTCHA, if enabled, is used for abuse prevention. Optional analytics and advertising trackers are not enabled. Hosting, authentication, database, and email providers process the data required for their roles. The operator must publish its final processor list, hosting locations, and any international-transfer safeguards before opening public registration.",
      ],
      [
        "Retention",
        "Active account data remains while needed to provide the service. Deleted post text has a 30-day recovery period; permanent erasure can be requested earlier. Account closure offers 30 days to recover before final app-data and authentication cleanup. Daily-limit event logs are kept for up to two days, notifications for 90 days, report evidence for 90 days, resolved reports for 180 days, and moderation audit records for one year. Specific, documented legal holds have a review/expiry date. Backups follow the hosting provider's documented lifecycle and are isolated from routine use; a recovery must reapply outstanding deletion requests.",
      ],
      [
        "Your choices and rights",
        "Use Account & privacy to download your data, manage your identity, or request deletion. You can request access, correction, erasure, restriction, portability, or object to processing where applicable. You can complain to a competent data-protection authority. Contact us for personal information embedded in another member's post or a retained evidence record. We verify requests proportionately and respond within applicable legal deadlines.",
      ],
      [
        "Writer recognition",
        "Writer status is based on active posts, distinct contributing days, and independent ratings. Higher automatic statuses require a minimum rating average. Removed content does not qualify. Club Captain is reviewed by the community team and grants no automatic moderation powers. You can ask for a review if your status appears incorrect.",
      ],
    ],
  },
  rules: {
    title: "Community Rules",
    intro: "Bring the football. Bring the banter. Leave the abuse out.",
    sections: [
      [
        "Rivalry is welcome",
        "Disagree with the take, not someone's identity. No hate, targeted harassment, threats, doxxing, sexual exploitation, or encouragement of violence. A rival badge is an invitation to debate, never a reason to pile on.",
      ],
      [
        "Keep the conversation moving",
        "Start up to 5 topics per day. You can write up to 30 later posts and 60 replies per day. Before another top-level post in the same topic, wait for two posts by other writers. Replies stay together under their parent post; you can address a reply within that same lane.",
      ],
      [
        "Home and away",
        "Only FAN-club supporters and followers can start a club topic. Visitors can join in with 1 top-level post and 3 replies per club per day across all of that club's topics. Anyone with an active membership can rate. Daily limits reset at 00:00 UTC; deleting a post does not replenish them.",
      ],
      [
        "Rate the take",
        "Use the 0–10 scale for the post itself. One rating per post or reply, up to 100 new ratings a day. You can change your score. You cannot rate yourself. No alternate accounts, rating exchanges, or coordinated downrating of rival supporters.",
      ],
      [
        "Facts, rumours, and sources",
        "Label rumours honestly. Add an original source when reporting news, transfers, or claims. Do not invent quotes, impersonate journalists, or present speculation as an official announcement. Credit reporting with a link, not a copied article.",
      ],
      [
        "Use your own voice",
        "No spam, repeated promotional posts, scams, or automated posting. No betting, gambling, payment solicitation, or real-money prediction features. Keep posts about football and the people who follow it.",
      ],
      [
        "When something crosses the line",
        "Report the specific post and explain why. Do not organise mass reports. The community team reviews reports and explains restrictions. You can follow a report and appeal a decision from your account. For a credible emergency, contact the relevant emergency service; this community is not an emergency response service.",
      ],
    ],
  },
};
export async function generateMetadata({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  return { title: documents[document]?.title ?? "Community policies" };
}
export default async function LegalPage({
  params,
}: {
  params: Promise<{ document: string }>;
}) {
  const { document } = await params;
  const doc = documents[document];
  if (!doc) notFound();
  const operator = getCommunityOperator();
  const ready = isCommunityLaunchReady();
  return (
    <>
      <SiteHeader />
      <main id="main-content" className="site-width reading-page py-10">
        <nav
          aria-label="Community policies"
          className="mb-8 flex flex-wrap gap-0.5 border-b border-line"
        >
          {Object.entries(documents).map(([key, value]) => (
            <Link
              key={key}
              href={`/legal/${key}`}
              aria-current={key === document ? "page" : undefined}
              className={`-mb-px border-b-2 px-3 pb-2.5 text-[13.5px] font-semibold transition-colors ${
                key === document
                  ? "border-navy text-ink"
                  : "border-transparent text-ink-3 hover:text-ink"
              }`}
            >
              {value.title}
            </Link>
          ))}
        </nav>

        {!ready && (
          <p className="mb-6 rounded-lg border border-warn-line bg-warn-wash px-4 py-3 text-[13px] leading-6 text-warn">
            Pre-launch policy draft. Operator details and legal review are being
            finalised. Public registration is not open under these draft terms.
          </p>
        )}

        <header className="reading-copy">
          <p className="t-eyebrow">Version {COMMUNITY_POLICY.version}</p>
          <h1 className="mt-2 t-page-title text-ink">{doc.title}</h1>
          <p className="mt-3 text-[15px] leading-7 text-ink-2">{doc.intro}</p>
        </header>

        <div className="reading-copy mt-8 grid gap-7">
          {doc.sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="mb-1.5 t-section text-ink">{title}</h2>
              <p className="text-[13.5px] leading-7 text-ink-2">{body}</p>
            </section>
          ))}
        </div>

        <footer className="reading-copy mt-10 border-t border-line pt-5 text-[13px] leading-7 text-ink-3">
          {operator.name ? (
            <p>
              Operated by {operator.name}, {operator.country}.{" "}
              {operator.address}
            </p>
          ) : (
            <p>
              Operator identity will be published before public registration
              opens.
            </p>
          )}
          {operator.contact && (
            <a
              href={`mailto:${operator.contact}`}
              className="font-semibold text-navy hover:underline"
            >
              {operator.contact}
            </a>
          )}
        </footer>
      </main>
    </>
  );
}
