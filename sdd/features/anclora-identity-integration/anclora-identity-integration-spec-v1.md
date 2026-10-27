# Advisor AI — Anclora Identity Integration v1

## Status

Development implementation; not enabled in any deployed environment.

## Goal

Move Advisor AI sign-in and its `admin | partner | user` authorization source from Supabase Auth / `public.users.role` to Anclora Identity, while preserving Advisor's existing user IDs and user-owned records.

## Scope

- Register Advisor AI as an OIDC relying party with invitation-gated membership.
- Use Authorization Code + PKCE, `openid-client`, state/verifier cookies, and an app-owned HTTP-only session.
- Have Identity issue the Advisor-specific application role claim. `GROUP_OWNER` is an explicit platform override to Advisor `admin`.
- Link an Identity subject to exactly one existing Advisor `users` row using a verified, normalized email. Never create or remap business ownership rows during login.
- Issue a short-lived Neon `authenticated` JWT for existing user-scoped database access using the linked Advisor row ID as `sub`.
- Keep existing Supabase Auth behavior behind the disabled-by-default migration flag. Identity mode must fail closed unless the database provider is Neon.
- Supabase Storage and database-provider migration are separate concerns; this feature does not delete Supabase data or apply migrations to production.

## Authorization mapping

Identity membership alone grants no Advisor business role. Identity supplies one of the registered Advisor roles (`admin`, `partner`, `user`) in `application_roles`; absent/invalid role denies access. `GROUP_OWNER` maps to `admin`. The local `public.users.role` column is retained for rollback/history but is no longer authoritative in Identity mode.

## Acceptance criteria

1. Disabled flag preserves the legacy login flow.
2. Enabled flow redirects to Identity; callback validates issuer/client/state/PKCE and verified email.
3. Callback denies users without active Advisor membership and valid application role.
4. Existing Advisor `users.id` is retained and used as Neon JWT `sub`, so records and RLS ownership remain intact.
5. Admin UI/API authorization reads the Identity session role, not `public.users.role`.
6. Logout clears the Advisor session and the next login requires an explicit Identity login prompt.
7. No production environment or database is modified by implementation.

## Operational prerequisites

- Identity deployment must have the Advisor OIDC client, redirect URIs and per-app role policy configured.
- Advisor development environment must set matching server/public feature flags and OIDC client configuration.
- Neon must trust the configured Advisor JWT signing key and issuer for `authenticated` user JWTs.
- Legacy privileged roles must be provisioned centrally in Identity before users enter enabled mode.
