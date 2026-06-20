# Tasks: 001-ci-cd-dev-master

> **Spec**: `specs/001-ci-cd-dev-master/spec.md`
> **Plan**: `specs/001-ci-cd-dev-master/plan.md`
> **Owner**: Codex
> **Created**: 2026-06-21

Tasks are ordered so each one leaves the repo in a green, committable state.

## 0. Branch setup

- [x] Branch: `dev`

## 1. Foundational

- [ ] **T-1.1** — Add CI workflow for `dev` and `master`.
  - Acceptance: backend, mobile, AI, contract, compose jobs exist.
  - Verify: parse `.github/workflows/ci.yml` with PyYAML.

- [ ] **T-1.2** — Add artifact-only CD workflow.
  - Acceptance: workflow publishes backend, mobile, contracts, Supabase, runtime bundles.
  - Verify: parse `.github/workflows/cd-artifacts.yml` with PyYAML.

- [ ] **T-1.3** — Add optional pattern frontend workflow.
  - Acceptance: workflow has path filters for `pattern-frontend/**`.
  - Verify: parse `.github/workflows/pattern-frontend.yml` with PyYAML.

## 2. Data layer

- [ ] **T-2.1** — Add Supabase migration dry-run workflow.
  - Acceptance: pgvector Postgres service applies foundation migration.
  - Verify: first GitHub Actions run reaches `supabase-migration-dry-run`.

## 3. Documentation

- [ ] **T-3.1** — Add branch protection guide.
  - Acceptance: required checks for `dev` and `master` are documented.
  - Verify: manual review of `docs/ci/branch-protection.md`.

- [ ] **T-3.2** — Update Git workflow docs to `dev/master`.
  - Acceptance: docs no longer instruct `develop/main` as the active branch pair.
  - Verify: `grep -R "develop" docs/detail/14_GIT_WORKFLOW_AND_RULES.md` has no active workflow references.

## 4. Verification

- [ ] **T-4.1** — Run local checks.
  - Verify:
    - `ai_engine/.venv/bin/python -m pytest ai_engine/tests`
    - JSON schema parse
    - YAML workflow parse
    - `docker compose -f docker-compose.local.yml config`

- [ ] **T-4.2** — Push `dev` and inspect CI.
  - Acceptance: every required job is green or has a concrete follow-up fix.
  - Verify: GitHub Actions run summary.
