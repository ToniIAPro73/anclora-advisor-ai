# Vercel Blob Storage Cutover — Plan v1

1. Implement a server-only private Blob adapter with lazy configuration and path validation.
2. Replace the labor-evidence upload, download, and delete calls while preserving current authentication and Neon ownership checks.
3. Replace invoice-import upload and compensation cleanup calls while preserving pathnames in Neon.
4. Connect a private Blob store to the Advisor Vercel project and configure the token for Preview and Production without exposing it to the client.
5. Validate the flow in Preview using the dedicated QA identity; leave Supabase source objects and buckets intact.
6. Present the exact diff and Preview result for Toni's review before commit/push or production cutover.

Supabase Auth and the current database provider are unchanged by this feature.
