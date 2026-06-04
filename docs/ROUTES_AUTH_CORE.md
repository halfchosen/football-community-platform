# Routes - Auth and User Core

## Public Routes

`/`
Landing page

`/login`
Login form with Google and email/password

`/signup`
Registration form

`/auth/callback`
Supabase auth callback route

`/reset-password`
Request password reset

`/update-password`
Set new password after reset

`/u/[username]`
Public user profile page

## Protected Routes

`/onboarding`
Required after first login if onboarding is not complete

`/app`
Main app shell after onboarding

`/settings/profile`
Edit own profile

`/settings/account`
Account settings

## Route Rules

- logged-out users can access public routes
- logged-in users without onboarding go to `/onboarding`
- logged-in users with completed onboarding can access `/app`
- users cannot access main app before completing onboarding
