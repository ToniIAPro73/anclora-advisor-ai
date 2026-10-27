# Vercel Blob Storage Cutover — Tasks v1

- [x] Add server-only Blob storage adapter; keep Supabase as the safe default provider.
- [x] Route evidence upload, authenticated download, and delete through the adapter.
- [x] Scope evidence downloads/deletes to the exact path referenced by the authorized labor action.
- [x] Route invoice import upload and compensation cleanup through the adapter.
- [x] Document Blob environment requirements without recording secret values.
- [x] Create the private `advisor-ai-private-assets` store and connect it to Vercel Preview and Production.
- [ ] Select the Blob provider in Preview and validate against the dedicated QA identity.
- [ ] Preserve Supabase buckets and objects until Toni reviews the cutover.
- [ ] Submit the uncommitted development changes and validation evidence to Toni.
