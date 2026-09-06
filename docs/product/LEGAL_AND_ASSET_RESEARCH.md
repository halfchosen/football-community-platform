# Legal and club asset research

Reviewed 5 September 2026. This is implementation research and an operator decision brief, not a legal opinion or a completed compliance certification.

## Club crests and images

Sportmonks says logo and profile-photo rights remain with their owners and the application operator must arrange permission. API-Football separately states that API access does not grant publication/commercial rights; the user must obtain relevant authorisations. A paid API subscription is therefore not evidence of a licence for club crests. Seeing an asset on Flashscore or Transfermarkt does not establish the terms under which those services use it.

Sources:
- [Sportmonks terms](https://www.sportmonks.com/terms-of-service/)
- [API-Football terms, Service & data and Data/Logos/images](https://www.api-football.com/terms)
- [Juventus Academy trademark terms](https://academy.juventus.com/en/training-camp-futbol-labs-events/terms-and-conditions)

Practical procurement route: obtain written permission from a club/league or a supplier explicitly authorised to sublicense the crests. Ask for worldwide web/mobile community use, commercial/advertising use, permitted sizes and alterations, attribution, caching, territories, term, renewal, takedown, and warranties of authority. No verified universal price or one-payment licence was found. Ask for a concrete quote before buying; no purchase or external message has been made.

The implemented asset boundary stores club ID, HTTPS asset URL, rights holder, permission reference, approver, and expiry in a private registry. Monograms remain the default. Merely altering a crest, adding attribution, or writing “unofficial” is not treated as permission. Actual licensed assets are enabled only after the relevant agreement is recorded and its scope reviewed.

## Privacy and retention

GDPR applicability depends on establishment and on offering services to or monitoring people in the EU. Being international does not mean choosing GDPR in place of every national law. The European Commission explains purpose limitation, data minimisation, storage limits, transparency, and individual rights. A 30-day recycle bin is a product recovery policy; it is not a universal GDPR retention requirement. The operator needs reasons for each period and a process for earlier erasure, applicable exceptions, and legal holds.

Sources:
- [European Commission: GDPR principles and required privacy information](https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en)
- [European Commission: who the data protection law applies to](https://commission.europa.eu/law/law-topic/data-protection/reform/rules-business-and-organisations/application-regulation/who-does-data-protection-law-apply_en)

## Platform reporting

The DSA includes obligations for online intermediaries and platforms, with requirements differing by service type and size. A report button alone does not establish DSA compliance. Determine applicability, illegal-content notice requirements, contact/representation obligations, transparency duties, reasons for decisions, appeals, and relevant small-business exemptions before public launch. The built-in authenticated reporting and review queue is a functional starting point; an externally accessible illegal-content/contact channel must be confirmed with the operator.

Source: [European Commission: Digital Services Act](https://digital-strategy.ec.europa.eu/en/policies/digital-services-act).

## Required operator decisions

- Legal entity/person operating the service, establishment country, postal address, and real support/privacy contact.
- Processor inventory, Supabase/hosting/email region and contracts, international-transfer safeguards, and backup retention.
- Final Terms, Privacy Notice, Community Rules, launch review, and version approval.
- Staff accounts authorised to review reports; no existing user is automatically promoted.
- Rights-owner/supplier contracts for any real crests. API subscription price alone does not satisfy this.

Public registration and agreement acceptance are gated in production until the operator fields and `COMMUNITY_LEGAL_APPROVED=true` are configured. This setting records an operator launch decision; it is not a legal certification.
