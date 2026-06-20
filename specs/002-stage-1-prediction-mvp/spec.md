# Spec: 002-stage-1-prediction-mvp

> **Spec ID**: 002
> **Author**: Codex
> **Created**: 2026-06-21
> **Status**: draft
> **Constitution**: `.codex/constitution.md` v1.0.0

## 1. Intent

Deliver Stage 1 Prediction MVP as a local, contract-first vertical slice where sample match data flows through Supabase/Redis, Python inference, ASP.NET Core BFF, and the mobile client without betting framing.

## 2. Context

- Stage 0 / CI foundation is complete enough to continue after `specs/001-ci-cd-dev-master`.
- Current foundations already exist: Supabase migration draft, mock ASP.NET Core analytics endpoint, mock Python AI prediction endpoint, Airflow sample DAG, Redis sample feature file, OpenAPI v1 draft, and MAUI mobile shell.
- Stage 1 should move from disconnected mocks to one reproducible analytics path using local/sample data only.
- This stage follows `.codex/rules/team-roles.md`: one ML Engineer, one Fullstack Engineer, one Data Engineer.

## 3. Non-goals

- No betting, staking, odds-lock, or wagering advice language.
- No production deployment or hosted Supabase migration apply.
- No real paid data-provider ingestion and no provider adapter skeleton yet.
- No advanced RAG/chat, SHAP production explanations, admin dashboards, simulations, or scheduled production snapshots.
- No MLflow/Feast/Qdrant reintroduction.
- No mobile direct access to domain tables.

## 4. Users & flows

- Primary user: analyst using the mobile app to inspect a match prediction and understand model confidence.
- Secondary user: project maintainer verifying that the local end-to-end prediction path works.
- Happy path:
  1. Data Engineer loads a small sample fixture, odds snapshot, model registry row, and feature materialization metadata into local Supabase-compatible Postgres/Redis.
  2. ML Engineer exposes Python inference that reads the feature key and returns 1X2 probabilities, score matrix, and provenance.
  3. Fullstack Engineer calls Python AI through the backend BFF, combines fixture/odds/model output, computes total goals, BTTS, and analytics edge, then returns `/api/v1/matches/{matchId}/full`.
  4. Mobile client performs a lightweight Match Detail integration: call the backend and render loading, success, unavailable, and stale-data states without UI polish.
- Failure flows:
  - Missing feature key returns a graceful unavailable analytics section, not a fabricated prediction.
  - Stale feature metadata marks prediction reliability as degraded.
  - Python AI timeout returns ProblemDetails or a defined fallback response.

## 5. Functional requirements

| ID | Requirement | Priority | Acceptance |
|---|---|---:|---|
| FR-1 | Local sample data exists for at least one fixture, odds snapshot, feature vector, and active model version | P0 | Data seed/check script can load and verify deterministic rows/keys with ULID internal match id and provider external id |
| FR-2 | Python AI inference reads the Redis/sample feature contract instead of returning only hard-coded mock output | P0 | AI tests cover valid feature, missing feature, and provenance fields |
| FR-3 | Backend `/api/v1/matches/{matchId}/full` orchestrates fixture, odds, feature metadata, AI inference, and derived analytics | P0 | Backend integration test validates response shape and fallback behavior |
| FR-4 | Response includes prediction provenance: model version, feature snapshot hash, and training-data cutoff date | P0 | Contract and tests fail if provenance is missing |
| FR-5 | Total goals distribution and BTTS are derived from score matrix, not separately fabricated | P0 | Unit tests compare derived values against fixed score matrix input |
| FR-6 | Mobile Match Detail consumes the backend contract in lightweight form and renders loading, success, empty/unavailable, and stale states | P1 | MAUI build passes and manual/local smoke path is documented; no UI polish is required |
| FR-7 | OpenAPI and internal AI JSON schemas reflect Stage 1 contracts | P0 | Contract validation passes in CI/local checks |
| FR-8 | Stage 1 remains analytics-only in user-facing copy | P0 | Disclosure check finds no betting advice language |

## 6. Role responsibilities

Follow `.codex/rules/team-roles.md`.

| Role | Responsibilities in this spec | Acceptance |
|---|---|---|
| ML Engineer | Replace pure mock inference with deterministic baseline inference over the Stage 1 feature contract; preserve calibrated probability language and provenance | `uv run pytest` or equivalent AI tests cover inference, missing features, and provenance |
| Fullstack Engineer | Implement backend orchestration, contract updates, derived analytics, ProblemDetails fallback, and mobile Match Detail integration | .NET build/tests pass; OpenAPI validates; MAUI Android build or documented local smoke passes |
| Data Engineer | Provide local sample schema/seed path, Redis feature materialization key, feature metadata, freshness/lineage checks, and idempotent verification | Migration/seed verification proves deterministic row counts and Redis keys |

## 7. Non-functional requirements

- **Performance**: local `/api/v1/matches/{matchId}/full` should complete under 3 seconds with Python AI and Redis running.
- **Reliability**: missing AI/feature data must degrade explicitly; no silent fabricated values.
- **Security**: no service-role key in client; mobile remains BFF-only; no direct mobile domain-table access.
- **Observability**: backend logs prediction orchestration status, fallback reason, model version, feature hash, and freshness status without secrets.
- **Compliance**: user-facing copy must say analytics/explainable AI and avoid betting advice terms.

## 8. Data contract

- Use existing Supabase foundation tables where possible.
- Add only forward-compatible migration changes required for Stage 1 sample data, model registry, feature metadata, and odds snapshots.
- Match identity must use an internal ULID string as the stable system identifier and a separate provider external id for source mapping.
- Stage 1 sample identity format:

```text
matchId: 01JZ8Q8V6K7R4P9A2X3M5N6B7C
provider: sample
providerMatchId: sample-epl-2026-08-15-ars-che
```

- Redis key shape must be documented, deterministic, and owned by the Data Engineer:

```text
feature:match:{matchId}:snapshot:{featureSnapshotHash}
```

- Privacy class: internal analytics data; no personal data.

## 9. API contract

- Public route: `GET /api/v1/matches/{matchId}/full`, where `matchId` is the internal ULID string.
- Internal AI route: existing prediction route may evolve, but must remain internal-only.
- Response must include:
  - fixture identity: internal `matchId`, `provider`, `providerMatchId`, and kickoff metadata
  - 1X2 probabilities
  - score matrix
  - total goals distribution
  - BTTS probability
  - market benchmark and analytics edge
  - reliability/freshness status
  - provenance: model version, feature snapshot hash, training-data cutoff date
- Errors must use ProblemDetails for invalid match id, missing fixture, and internal AI failure.

## 10. Risks & open questions

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| Existing schema draft does not fully support Stage 1 sample odds/features | M | M | Data Engineer proposes minimal forward migration before implementation |
| MAUI local test path is slower than backend/AI work | M | M | Fullstack Engineer prioritizes backend contract first, then mobile states |
| Baseline model quality is mistaken for production readiness | M | M | Label output as baseline/local MVP and require provenance/freshness |
| Redis/local Supabase startup is brittle | M | M | Keep deterministic seed/check scripts and document smoke commands |

Approved decisions:

- Stage 1 uses sample/local data only; provider adapter skeleton is deferred.
- Mobile is not fully deferred, but remains lightweight: backend call plus basic state rendering only.
- Match identity uses internal ULID plus provider external id; do not use `match-123` as the canonical representation.

## 11. Definition of done

- [ ] All P0 requirements verified by automated tests or deterministic local checks.
- [ ] ML Engineer, Fullstack Engineer, and Data Engineer deliverables are all verified.
- [ ] PR checklist in `.codex/rules/git.md` §4 passes.
- [ ] No service-role key in client; no direct mobile table access.
- [ ] Prediction provenance captured: model version, feature snapshot hash, training-data cutoff.
- [ ] Docs updated for local Stage 1 runbook and contracts.
- [ ] Constitution guardrails still hold.

## 12. References

- Previous spec: `specs/001-ci-cd-dev-master/spec.md`
- Plan: `specs/002-stage-1-prediction-mvp/plan.md`
- Tasks: `specs/002-stage-1-prediction-mvp/tasks.md`
- Role rule: `.codex/rules/team-roles.md`
- Product plan: `docs/plan.md`
- Sprint roadmap: `docs/detail/10_SPRINT_PLANNING.md`
- Three-person plan: `docs/detail/16_THREE_PERSON_DELIVERY_PLAN.md`
