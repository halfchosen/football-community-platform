# Auth and Onboarding Scope

> Historical foundation document. September 2026 community scope, schema and
> security overrides are authoritative in [Community blueprint](product/COMMUNITY_BLUEPRINT.md),
> [Database and security](product/DATABASE_AND_SECURITY.md) and
> [Operations](product/OPERATIONS.md). Check [release status](product/RELEASE_STATUS.md)
> before treating any setup or validation described below as current.

## Goal

Create the first stable foundation for the football community platform.

This phase should not implement:
- forum
- comments
- entries
- quizzes
- ratings
- translations
- moderation queue
- match discussions
- private messaging

It should only implement the account and user identity foundation.

## User Flow

1. Visitor opens the website.
2. Visitor can sign up with:
   - Google
   - email/password
3. If email/password is used, the user must confirm email.
4. User can reset password.
5. After first login, user is redirected to onboarding.
6. User completes onboarding:
   - username
   - 18+ confirmation
   - primary supported club
   - secondary supported clubs
   - preferred interface language
   - community rules acceptance
7. After onboarding, user can access the main app shell.
8. User has a public profile page.

## Required Account Features

Required:
- Google auth
- email/password auth
- email confirmation
- password reset
- protected routes
- onboarding gate
- public profile
- editable own profile

Not required yet:
- forum
- comments
- quizzes
- ratings
- translations
- moderation
- admin panel
- private messaging
- payments
- betting

## User Data

Collect only:
- username
- primary club
- secondary clubs
- preferred language
- 18+ confirmation
- community rules acceptance timestamp

Avoid collecting:
- full legal name
- exact birthdate
- phone number
- address
- private bio details

## Football Identity

A user’s football identity is central to the product.

Visible identity:
- username
- primary club
- generation badge
- level
- title
- selected badge placeholder

Example:

Username: MarcoBaggio  
Club: Juventus  
Generation: First Generation Writer  
Level: 4  
Title: Writer  
Selected Badge: First Entry

## Generation System

Generation is permanent.

Initial generation rule:
- Users who register during the first public launch year receive "First Generation Writer".

Later:
- Generation can be assigned by registration year or launch period.

Generation should not be editable by the user.

## Level and Title System

Level is numeric.

Initial titles:
- Level 1: Supporter
- Level 2: New Writer
- Level 3: Contributor
- Level 4: Writer
- Level 5: Active Writer
- Level 6: Senior Writer
- Level 7: Lead Writer
- Level 8: Community Leader
- Level 9: Club Voice
- Level 10: Club Legend

Contributor is not the lowest title.

For this phase:
- create the data structure
- assign default level and title
- do not build complex XP logic yet

## Club Metadata

Initial leagues:
- Premier League
- Championship
- Serie A
- Serie B
- La Liga
- Bundesliga
- Ligue 1
- Süper Lig

Club metadata should be stored in database tables, not hardcoded in components.

Each club:
- name
- slug
- country
- league
- tier
- logo placeholder
- active status

## Future Dependencies

This account foundation will later support:
- fan-based forum permissions
- club-specific communities
- match discussions
- quiz authorship
- ratings
- gamification
- moderation
- translations
