# Advisor AI — Anclora Identity Integration Plan v1

1. Extend Identity with a typed per-application role on memberships, audited operator role assignment, and Advisor OIDC registration.
2. Add an opt-in Advisor OIDC relying-party flow and signed application session.
3. Preserve legacy Advisor row ownership by linking verified Identity email to the existing local user row.
4. Use short-lived Neon user JWTs for authenticated database calls; reject Identity mode when the database is not Neon.
5. Route login, logout, session inspection, middleware, and admin authorization through the Identity session when enabled.
6. Document secrets, redirect URIs, role migration, rollback, and the required environment enablement sequence.
7. Run typecheck/lint gates after implementation; do not enable or deploy the feature as part of this change.
