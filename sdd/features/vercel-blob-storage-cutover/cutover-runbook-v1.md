# Advisor AI Storage Cutover Runbook v1

The runtime changes are staged behind `ADVISOR_STORAGE_PROVIDER=supabase`. Keep this setting until a private Vercel Blob store is connected and Preview validation is ready.

## Provisioning

1. The **private** Vercel Blob store `advisor-ai-private-assets` is created and connected to the Advisor AI project for Preview and Production. The Vercel project injects its read-write token server-side; it is not exposed through a `NEXT_PUBLIC_` variable.
2. Deploy the code while `ADVISOR_STORAGE_PROVIDER=supabase`; current runtime behavior stays on Supabase.
3. Set `ADVISOR_STORAGE_PROVIDER=vercel_blob` in Preview only.
4. Validate evidence upload, authorized read, delete, and invoice PDF import with the dedicated QA identity.
5. Preserve all Supabase buckets. The last inventory found three unreferenced evidence objects (306 bytes) and zero referenced invoice-import files; retain the evidence objects as archive data.
6. After Toni reviews Preview, production cutover requires separate authorization. Production can then set `ADVISOR_STORAGE_PROVIDER=vercel_blob`.

The application database paths remain unchanged. No copy of the unreferenced evidence objects is required for active application behavior; they remain in Supabase until a separate disposition decision.
