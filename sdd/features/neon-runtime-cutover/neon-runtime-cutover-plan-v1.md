# Neon Runtime Cutover — Plan v1

1. Close the provider-routing gap in RAG retrieval; audit all direct database client construction.
2. Add regression tests that prove both provider selection and separation of Auth/Storage from database routing.
3. Validate production Neon schema/RLS/vector functions and externally published JWKS configuration.
4. Publish the reviewed code to development Preview; enable Neon only in Preview and use the dedicated QA account for read/write, RAG, Auth, and Storage smoke checks.
5. After Toni validates Preview, promote through the repository workflow. Keep Supabase active as rollback until production validation is complete.
6. Update `.anclora/PRODUCTION_RUNTIME.md` and migration documentation to reflect Neon DB, Supabase Auth, and Supabase Storage separately.

No production switch or Supabase shutdown occurs before Preview acceptance.
