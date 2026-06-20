# ADR-0001: CI/CD branch gates for dev and master

> Status: accepted
> Date: 2026-06-21

## Context

The repository uses `dev` for integration and `master` for the protected release branch. Before Stage 1 feature work continues, the project needs automated build, test, contract, and migration checks.

## Decision

Use GitHub Actions as the CI/CD platform.

- CI runs on pull requests and pushes to `dev` and `master`.
- CD publishes artifacts only until a deployment target is selected.
- `pattern-frontend` remains optional and path-filtered.
- Supabase migration validation runs against a disposable pgvector Postgres service.

## Consequences

- Branch protection can require CI checks before merging.
- No deployment credentials are needed for this stage.
- First CI runs may expose Linux/MAUI workload issues that were not visible locally.
