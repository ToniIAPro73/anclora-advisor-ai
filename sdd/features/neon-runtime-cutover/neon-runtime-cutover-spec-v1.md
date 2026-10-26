# Neon Runtime Cutover — Specification v1

## Status

Draft for implementation and Preview validation. The production database is not considered migrated until every application data path uses Neon and authenticated read/write QA passes.

## Goal

Make Neon PostgreSQL the application-data database for Advisor AI while retaining Supabase Auth and Supabase Storage as separate services. Keep a reversible provider switch until production cutover is reviewed.

## Current evidence

- Neon contains the copied public schema and rows; table names and exact per-table row counts were compared with Supabase.
- `DATABASE_PROVIDER` defaults to `supabase`, so the runtime has not switched.
- The shared user/admin database clients support Neon Data API, but RAG retrieval creates its own service-role Supabase client and bypasses the provider switch.
- Browser Supabase usage is currently for authentication; uploads/downloads must continue using Supabase Storage.
- The existing validation checklist still requires a published, externally fetchable JWKS and authenticated Preview smoke before enabling Neon.

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
4. Auth login/session validation and Storage upload/download still use Supabase.
5. Unauthenticated Data API access is rejected; authenticated QA access obeys existing RLS and ownership rules.
6. Type-check, lint, targeted database/provider tests, and Preview smoke pass before production promotion.
7. Supabase is not paused or deleted as part of this cutover.

## Out of scope

- Moving authentication to Anclora Identity or Neon Auth.
- Moving file/object storage away from Supabase.
- Moving the web deployment from Vercel to Cloudflare.
- Deleting or pausing the Supabase project.

## Rollback

Set the deployment's `DATABASE_PROVIDER=supabase`, redeploy, and retain Neon data untouched until the rollback window closes. Do not dual-write.
