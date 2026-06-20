# Supabase

Foundation schema drafts for Supabase Postgres.

## Files

- `migrations/001_architecture_foundation.sql`: forward-only foundation schema draft.
- `rollback/001_architecture_foundation.rollback.sql`: development rollback only.

## Notes

- The migration enables `pgvector`.
- Mobile access remains through the backend by default.
- `public.matches_view` is read-oriented and uses `security_invoker = true`.
- Prediction provenance fields are present on snapshot and serve-event tables.
