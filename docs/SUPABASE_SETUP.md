# Supabase Setup

## Create Project

Create a Supabase project named:

`football-community-platform`

Recommended region:
- Europe / Frankfurt or the closest available European region

## Environment Variables

Add these to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

Do not commit `.env.local`.

## Authentication Providers

Enable:
- Email/password
- Google OAuth

## Email Confirmation

Keep email confirmation enabled for production.

During local development, configure redirect URLs correctly.

## Redirect URLs

Add local development redirect URL:

```txt
http://localhost:3000/auth/callback
```

Later add production redirect URL:

```txt
https://your-domain.com/auth/callback
```

## Password Reset

Password reset should redirect to:

```txt
http://localhost:3000/update-password
```

Later production:

```txt
https://your-domain.com/update-password
```

## Database

Codex should create SQL migrations for:
- countries
- leagues
- clubs
- generations
- titles
- levels
- badges
- user_profiles
- user_private_settings
- user_supported_clubs
- user_badges
- xp_events

## RLS

Enable Row Level Security for user-owned tables.

At minimum:
- users can update only their own profile
- users can update only their own private settings
- users can manage only their own secondary supported clubs
- normal users cannot modify XP, level, title, generation, or badges directly
