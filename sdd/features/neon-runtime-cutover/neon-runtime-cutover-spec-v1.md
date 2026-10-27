# Neon Runtime Cutover — Specification v1

## Status

**Staged; production cutover not verified (2026-10-27).** The `development` Preview environment now selects Neon and has branch-scoped Data API/JWT variables. Production still lacks `DATABASE_PROVIDER`, `NEON_DATA_API_URL`, and `NEON_SERVICE_JWT_PRIVATE_KEY`; application code defaults to Supabase there. No production cutover is claimed.

## Goal

Make Neon PostgreSQL the application-data database for Advisor AI while retaining Supabase Auth and Supabase Storage as separate services. Keep a reversible provider switch until production cutover is reviewed.

## Current evidence

- Neon contains the copied public schema and rows; table names and exact per-table row counts were compared with Supabase.
- `DATABASE_PROVIDER` defaults to `supabase`; only Vercel Preview for Git branch `development` now has an explicit `DATABASE_PROVIDER=neon` setting.
- Production Vercel has Neon Marketplace PostgreSQL connection variables but no Neon Data API/JWT variables or provider selector, so the deployed application still selects Supabase for application-data paths.
- Shared user/admin clients and RAG retrieval now use the provider-aware service client; no hard-coded RAG database client remains.
- Browser Supabase usage is currently for authentication; uploads/downloads must continue using Supabase Storage.
- The Neon service JWT signing key is present in Preview, but the app has no published JWKS route yet. Neon Data API trust configuration and authenticated read/write smoke remain unverified.

## Scope

- Route every application-database read and write through the provider-selected database API, including RAG retrieval.
- Keep Supabase Auth token validation and session handling on the Supabase project.
- Keep Supabase Storage operations on the Supabase project.
- Preserve RLS, `org_id`/user ownership boundaries, RPC behavior, vector search, and existing database migrations.
- Keep Supabase available as a rollback target until production is confirmed stable.
- Update the runtime contract only after the validated cutover; record Auth and Storage separately.

## Acceptance criteria

1. With `DATABASE_PROVIDER=neon`, no application-data query uses the Supabase database endpoint.
2. With `DATABASE_PROVIDER=supabase`, the existing behavior remains available for rollback.
3. RAG vector/hybrid retrieval works against Neon and returns equivalent results for a fixed fixture.
4. The current production Auth and Storage integrations remain separate from the database provider; their cutovers are tracked independently.
5. Unauthenticated Data API access is rejected; authenticated QA access obeys existing RLS and ownership rules.
6. Type-check, lint, targeted database/provider checks, and the authorized runtime smoke pass before production promotion; use Preview when that environment is configured for the required Neon Data API/JWKS flow.
7. Supabase is not paused or deleted as part of this cutover.

## Out of scope

- Neon Auth is out of scope; Anclora Identity is tracked by the separate identity integration SDD.
- Moving file/object storage away from Supabase.
- Moving the web deployment from Vercel to Cloudflare.
- Deleting or pausing the Supabase project.

## Rollback

For the current development Preview, set `DATABASE_PROVIDER=supabase` to roll back. Production remains on its current Supabase provider until a separate approved Neon cutover is fully configured and validated. Retain Neon data and do not dual-write.
