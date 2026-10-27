# Vercel Blob Storage Cutover — Specification v1

Status: Draft for implementation and Preview validation.

## Problem

Advisor AI stores labor evidence and imported invoice PDFs in Supabase Storage. The application database has already moved to Neon, while authentication remains on Supabase. Keeping file storage on Supabase prevents completing the planned storage consolidation.

## Goal

Move active Advisor AI file operations to a private Vercel Blob store while keeping Supabase Auth unchanged and preserving existing file authorization checks.

## Observed baseline (2026-10-26)

- `labor-evidence`: 3 objects (306 bytes); no current Neon or Supabase application rows reference them.
- `invoice-imports`: 0 objects; no invoice records reference imported storage paths.
- Application code uses storage paths in `labor_mitigation_actions.evidence_links` and `invoices.import_storage_path`.
- Labor evidence is uploaded, downloaded through an authenticated route, and deleted by server-side routes.
- Invoice PDF import uploads a file and removes it if the Neon record insert fails.

Unreferenced source objects must remain in Supabase until Toni explicitly reviews their disposition. They are not part of automatic cleanup.

## Scope

- Add a server-only Vercel Blob storage adapter for private uploads, reads, and deletes.
- Preserve existing pathnames as Blob pathnames so database records do not need a data migration.
- Replace Supabase Storage calls for labor evidence and invoice imports.
- Keep user/session validation and Neon row-level authorization in the existing routes.
- Configure the required private Blob store/token before enabling the new provider in Preview.
- Keep `ADVISOR_STORAGE_PROVIDER=supabase` as the safe default; select `vercel_blob` only after store setup and Preview validation.
- Keep the Supabase buckets available as rollback/archive sources until Preview validation and an explicit production cutover.

## Out of scope

- Migrating Supabase Auth or changing login/session behavior.
- Deleting Supabase objects or buckets.
- Changing the Neon schema or moving database data.
- Changing Vercel/Cloudflare hosting.

## Acceptance criteria

- AC1: New evidence uploads go to private Vercel Blob and persist the same path in Neon.
- AC2: Evidence downloads authorize the requesting user against the associated labor action before streaming private Blob content.
- AC3: Evidence deletion removes only the authorized object's Blob pathname and Neon reference.
- AC4: Invoice import uploads to private Blob; a failed Neon insert removes the newly uploaded Blob.
- AC5: No Blob token is exposed through `NEXT_PUBLIC_*`, browser responses, source files, or logs.
- AC6: The three currently unreferenced Supabase evidence objects remain untouched.
- AC7: Preview validation confirms upload/read/delete and rollback behavior before any production cutover.
