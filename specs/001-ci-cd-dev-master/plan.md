# Plan: 001-ci-cd-dev-master

> **Plan ID**: 001
> **Spec**: `specs/001-ci-cd-dev-master/spec.md`
> **Architect**: Codex
> **Created**: 2026-06-21
> **Status**: draft

## 1. Decision summary

Create GitHub Actions gates for `dev` and `master`, with CI as the required quality gate and CD limited to artifact publishing until a deployment target exists.

## 2. Architecture

```text
PR/push to dev/master
  -> CI
     -> repo-policy
     -> dotnet-backend
     -> dotnet-mobile-android
     -> python-ai
     -> contracts-and-compose
  -> Supabase Migration Dry Run when supabase files change
  -> CD Artifacts after green CI
```

## 3. Tech choices

| Concern | Choice | Why | Alternatives considered |
|---|---|---|---|
| CI provider | GitHub Actions | Repo remote is GitHub | External CI |
| Backend build | .NET 8 SDK | Matches backend target | .NET 9 |
| Mobile build | MAUI Android workload | Constitution mobile stack | Flutter/RN |
| AI tests | uv + pytest | Existing `uv.lock` and test setup | pip only |
| Migration dry-run | pgvector Postgres service | Matches Supabase + pgvector | Hosted Supabase |
| CD | Artifacts only | No deploy target yet | Staging/prod deploy |

## 4. API design

No API behavior changes. CI validates existing OpenAPI and internal AI schemas.

## 5. Data model

No new schema. CI dry-runs `supabase/migrations/001_architecture_foundation.sql` against a disposable pgvector Postgres container.

## 6. Security & privacy

- Mobile code is scanned for direct Supabase client access.
- Workflows require only repository read access.
- No deployment credentials are introduced.

## 7. Observability

- GitHub Actions job names are the required check names.
- Artifacts are named by subsystem and commit SHA.
- Branch protection docs define required checks.

## 8. Testing strategy

- Local validation: parse YAML/JSON and run AI pytest.
- CI validation: build backend, build mobile, test AI, validate contracts, validate compose, dry-run migration.
- Optional frontend validation: type check and build `pattern-frontend` only on path changes.

## 9. Rollout

1. Commit workflows and docs on `dev`.
2. Push `dev`.
3. Inspect first CI run.
4. Fix workflow failures without relaxing required gates.
5. Configure branch protection for `dev` and `master` using `docs/ci/branch-protection.md`.

## 10. Cost & infra

- No persistent infrastructure.
- GitHub Actions minutes are the only cost.
- MAUI workload install is expected to be the slowest job.

## 11. Risks & ADR links

- ADR-0001: `docs/adr/0001-ci-cd-branch-gates.md`

## 12. Definition of done

- [ ] CI, CD artifacts, migration, and pattern frontend workflows exist.
- [ ] Branch protection docs list required checks.
- [ ] Local YAML/JSON validations pass.
- [ ] AI tests pass locally.
- [ ] First GitHub Actions run on `dev` is reviewed.
