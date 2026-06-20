# Tasks: 002-stage-1-prediction-mvp

> **Spec**: `specs/002-stage-1-prediction-mvp/spec.md`
> **Plan**: `specs/002-stage-1-prediction-mvp/plan.md`
> **Owner**: ML Engineer + Fullstack Engineer + Data Engineer
> **Created**: 2026-06-21

Tasks are ordered so each one leaves the repo in a green, committable state.
Mark with `[x]` only when committed + pushed + CI green.

## 0. Branch setup

- [ ] **T-0.1** — Create branch `feature/stage1/002-prediction-mvp` from `dev`.
  - Owner role: Fullstack Engineer
  - Acceptance: branch exists and tracks the correct base.
  - Verify: `git status --short` is clean before implementation starts.

## 1. Contract freeze

- [ ] **T-1.1** — Freeze public and internal Stage 1 contracts.
  - Owner role: Fullstack Engineer
  - Acceptance: `contracts/openapi/footballpredict.v1.yaml` and `contracts/internal-ai/*.schema.json` describe ULID `matchId`, `provider`, `providerMatchId`, provenance, score matrix, total goals, BTTS, market benchmark, edge, and freshness state.
  - Verify: schema/OpenAPI validation command used by CI passes.
  - Dependencies: none.

- [ ] **T-1.2** — Freeze Redis feature key and feature vector fields.
  - Owner role: Data Engineer
  - Acceptance: feature key shape and field list are documented in the Stage 1 runbook or data README.
  - Verify: sample key can be derived from `matchId` and `featureSnapshotHash`.
  - Dependencies: none.

- [ ] **T-1.3** — Freeze AI inference request/response provenance rules.
  - Owner role: ML Engineer
  - Acceptance: AI response cannot be valid without `modelVersion`, `featureSnapshotHash`, and `trainingDataCutoff`.
  - Verify: AI schema test or unit test rejects missing provenance.
  - Dependencies: T-1.1, T-1.2.

## 2. Data layer

- [ ] **T-2.1** — Add deterministic Stage 1 sample seed/check path.
  - Owner role: Data Engineer
  - Acceptance: local sample fixture with internal ULID and provider external id, odds snapshot, model registry row, feature metadata, and Redis feature key can be loaded idempotently.
  - Verify: seed/check command reports expected row counts and Redis key.
  - Dependencies: T-1.2.

- [ ] **T-2.2** — Add minimal forward migration only if foundation schema cannot support Stage 1.
  - Owner role: Data Engineer
  - Acceptance: migration is forward-only and has development rollback where appropriate.
  - Verify: Supabase migration dry-run workflow or local Postgres apply succeeds.
  - Dependencies: T-2.1.

## 3. ML inference

- [ ] **T-3.1** — Implement Redis/sample feature reader in `ai_engine`.
  - Owner role: ML Engineer
  - Acceptance: reader returns typed feature data for the Stage 1 key and explicit missing-feature error otherwise.
  - Verify: `uv run pytest` from `ai_engine`.
  - Dependencies: T-1.2, T-2.1.

- [ ] **T-3.2** — Replace pure mock output with deterministic baseline inference.
  - Owner role: ML Engineer
  - Acceptance: inference returns 1X2 probabilities, score matrix, and provenance using the feature contract.
  - Verify: AI tests cover valid inference and missing feature.
  - Dependencies: T-3.1.

## 4. Backend orchestration

- [ ] **T-4.1** — Implement backend data and AI orchestration for `/api/v1/matches/{matchId}/full`.
  - Owner role: Fullstack Engineer
  - Acceptance: backend loads fixture/odds/model metadata, calls Python AI, validates provenance, and returns public contract.
  - Verify: .NET integration test for valid `matchId`.
  - Dependencies: T-1.1, T-2.1, T-3.2.

- [ ] **T-4.2** — Implement derived analytics from score matrix.
  - Owner role: Fullstack Engineer
  - Acceptance: total goals distribution and BTTS are derived from score matrix; edge is computed from latest market benchmark.
  - Verify: .NET unit tests with fixed score matrix and odds input.
  - Dependencies: T-4.1.

- [ ] **T-4.3** — Implement ProblemDetails and reliability/fallback states.
  - Owner role: Fullstack Engineer
  - Acceptance: missing fixture, AI unavailable, missing feature, stale data, and missing provenance produce documented responses/states.
  - Verify: .NET integration tests cover failure cases.
  - Dependencies: T-4.1.

## 5. Mobile client

- [ ] **T-5.1** — Wire MAUI Match Detail to backend Stage 1 contract.
  - Owner role: Fullstack Engineer
  - Acceptance: mobile client renders loading, success, unavailable, and stale states through the BFF only; no UI polish beyond basic state rendering is required.
  - Verify: MAUI Android build or documented local smoke if emulator is unavailable.
  - Dependencies: T-4.1, T-4.3.

## 6. Integration and docs

- [ ] **T-6.1** — Add Stage 1 local runbook.
  - Owner role: Data Engineer
  - Acceptance: runbook lists startup, seed/check, AI, backend, and mobile smoke steps.
  - Verify: commands are reviewed and executable locally where environment allows.
  - Dependencies: T-2.1, T-3.2, T-4.1.

- [ ] **T-6.2** — Run role-owned verification.
  - Owner role: ML Engineer + Fullstack Engineer + Data Engineer
  - Acceptance: each role reports its verification output in the PR summary.
  - Verify:
    - Data seed/check passes.
    - `uv run pytest` from `ai_engine` passes.
    - .NET backend tests/build pass.
    - Contract validation passes.
    - MAUI build or smoke note is completed.
  - Dependencies: T-5.1, T-6.1.

## Checkpoint for Approval

Implementation should not start until this task list is approved and the open questions in `spec.md` §10 are resolved.
