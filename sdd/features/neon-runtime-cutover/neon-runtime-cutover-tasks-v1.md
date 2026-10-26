# Neon Runtime Cutover — Tasks v1

- [x] Audit every database client factory and replace the RAG hard-coded Supabase database client with the provider-aware factory.
- [x] Add a regression test for Neon/Supabase provider routing and service JWT role selection.
- [ ] Verify Neon schema, RLS, vector functions, Data API grants, and JWKS trust configuration.
- [ ] Run focused local gates and capture results in the validation checklist.
- [ ] Deploy to development Preview; Toni validates with the dedicated QA identity.
- [ ] After Preview validation, promote via the governed workflow and verify production reads/writes.
- [ ] Update the production runtime contract to `DATABASE_PROVIDER=Neon`, retaining Supabase Auth and Storage.
- [ ] Keep Supabase active through the agreed rollback period; decommission only after separate explicit decision.
