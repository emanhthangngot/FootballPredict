# Plan: 002-stage-1-prediction-mvp

> **Plan ID**: 002
> **Spec**: `specs/002-stage-1-prediction-mvp/spec.md`
> **Architect**: Codex
> **Created**: 2026-06-21
> **Status**: draft

## 1. Decision summary

Build Stage 1 as one local vertical slice: deterministic sample data and Redis features feed Python baseline inference; ASP.NET Core orchestrates fixture, odds, AI output, derived analytics, and fallback behavior; MAUI consumes the public BFF contract in a lightweight state-rendering flow. The key trade-off is intentionally small sample/local scope, with provider adapter work deferred, so all three roles can integrate quickly without production credentials.

## 2. Architecture

```text
Local seed/check
  -> Supabase-compatible Postgres tables
  -> Redis feature key

MAUI Match Detail
  -> GET /api/v1/matches/{matchId}/full
  -> ASP.NET Core BFF
       -> Supabase fixture/odds/model metadata
       -> Redis freshness metadata if needed
       -> Python AI /internal/v1/predict
            -> Redis feature key
            -> baseline probabilities + scoreMatrix + provenance
       -> derive total goals + BTTS + analytics edge
       -> return contract + reliability state
```

Module boundaries:

- `supabase/` and `etl/`: schema, seed/check, feature materialization, lineage.
- `ai_engine/`: internal inference API, feature reader, baseline model wrapper, tests.
- `backend/FootballPredictor.Api/`: BFF orchestration, contracts, derived analytics, fallback, OpenAPI.
- `frontend/FootballPredictor.Mobile/`: Match Detail states through BFF only.
- `contracts/`: OpenAPI and internal AI JSON schemas.

Failure modes:

- Missing fixture: backend returns 404 ProblemDetails.
- Missing feature key: backend returns match data with analytics unavailable, or 503 ProblemDetails if core prediction is required by the approved contract.
- Python AI timeout: backend records fallback reason and returns stale/cache/market-implied fallback only if explicitly implemented in this stage.
- Missing provenance: backend rejects AI response and returns failure; prediction without provenance is never returned.

## 3. Three-role work plan

Follow `.codex/rules/team-roles.md`.

| Role | Stage deliverables | Dependencies | Verification |
|---|---|---|---|
| Data Engineer | Minimal Stage 1 seed/check path; sample fixture/odds/model registry rows; ULID internal match id plus provider external id; Redis feature key; freshness/lineage docs | Agreed feature key and contract fields | SQL/seed check verifies rows; Redis key check verifies expected feature hash |
| ML Engineer | Feature reader; deterministic baseline inference; score matrix generation; provenance enforcement; AI tests | Data Engineer feature contract | `uv run pytest` from `ai_engine` or existing equivalent |
| Fullstack Engineer | Backend orchestration; derived total goals/BTTS/edge; ProblemDetails; OpenAPI update; lightweight MAUI Match Detail states | Data and AI contracts frozen first | .NET build/tests; OpenAPI validation; MAUI Android build or documented smoke |

Parallelization:

- Start sequentially with contract freeze: Data + ML + Fullstack agree on feature key, request/response, and provenance fields.
- Data Engineer and ML Engineer can then work in parallel on seed/materialization and AI inference.
- Fullstack Engineer can update OpenAPI/client models in parallel after contract freeze, but backend integration waits for Data/AI check fixtures.
- Mobile UI state work can start after the public API response shape is stable.

## 4. Tech choices

| Concern | Choice | Why | Alternatives considered |
|---|---|---|---|
| Data source | Local Supabase-compatible Postgres plus Redis sample keys | Matches target architecture without production credentials | JSON-only fixtures; provider adapter skeleton |
| Match identity | Internal ULID plus provider external id | Scales to many providers and large match volume without collision | `match-123`; provider id as primary id; UUID v4 only |
| AI inference | Python FastAPI deterministic baseline over feature vector | Moves beyond mock while staying reproducible | Train full production model |
| Backend orchestration | ASP.NET Core BFF route `/api/v1/matches/{matchId}/full` | Existing boundary and mobile-safe access | Mobile direct Supabase read |
| Contract management | Existing OpenAPI + internal AI JSON schemas | CI already validates contracts | Implicit DTO-only contracts |
| Mobile | Existing .NET MAUI shell | Constitution-approved client stack | Pattern frontend as primary app |

## 5. API design

- Keep public endpoint: `GET /api/v1/matches/{matchId}/full`, where `matchId` is the internal ULID string.
- Keep internal AI endpoint internal-only; update request/response schemas under `contracts/internal-ai/`.
- Use ProblemDetails for:
  - invalid `matchId`
  - unknown fixture
  - AI unavailable
  - AI response missing provenance
- Do not expose service-role credentials or table access details to MAUI.

## 6. Data model

Expected Stage 1 data concepts:

- fixture/match row
- internal ULID `matchId`
- provider source fields: `provider`, `providerMatchId`
- odds snapshot row with freshness timestamp
- model version registry row
- feature materialization metadata with `featureSnapshotHash`
- prediction/audit row if already supported by existing foundation schema
- Redis feature key: `feature:match:{matchId}:snapshot:{featureSnapshotHash}`

Migration rule:

- Prefer seed/check scripts over schema expansion where existing foundation tables are enough.
- If schema changes are required, use a forward-only migration and development rollback only.
- RLS remains default-deny for domain tables; mobile does not read them directly.
- Do not use `match-123` as canonical identity in new Stage 1 data or contracts.

## 7. Security & privacy

- No service-role key in client or committed config.
- Mobile accesses only the backend BFF.
- User-facing copy must avoid betting advice language.
- Logs include model/version/freshness identifiers but not secrets.
- No personal data is introduced.

## 8. Observability

Minimum Stage 1 signals:

- Backend structured log fields: `matchId`, `modelVersion`, `featureSnapshotHash`, `trainingDataCutoff`, `freshnessStatus`, `fallbackReason`.
- AI structured log fields: `matchId`, `featureSnapshotHash`, `featureFound`, `modelVersion`.
- Data check output: row counts and Redis keys loaded.

Metrics can be added if local OpenTelemetry is already wired; otherwise logging is acceptable for this stage.

## 9. Testing strategy

- Data: seed/check command validates deterministic rows and Redis key.
- AI: unit tests for feature reader, valid inference, missing feature, and provenance.
- Backend: unit tests for total goals/BTTS derivation and edge calculation; integration test for `/matches/{id}/full`.
- Contracts: validate OpenAPI YAML and internal AI schemas.
- Mobile: build Android target and document manual smoke for Match Detail states.
- Policy: disclosure check for analytics-only language.

## 10. Rollout

1. Keep work on `dev` or a feature branch from `dev`.
2. Merge contract freeze first if needed.
3. Land Data and ML slices behind local/sample configuration.
4. Land backend orchestration and fallback tests.
5. Land mobile state consumption.
6. Run CI and local smoke.

No production deploy in this stage.

## 11. Cost & infra

- No new paid services.
- Local Docker stack remains Supabase-compatible Postgres, Redis, and Airflow where needed.
- Python and .NET run locally.
- Expected cost is only local compute and CI minutes.

## 12. Risks & ADR links

- ADR required only if Stage 1 changes data model shape materially or chooses a new fallback policy.
- Current linked context:
  - `docs/adr/0001-ci-cd-branch-gates.md`

| Risk | Impact | Mitigation |
|---|---:|---|
| Feature contract churn blocks parallel work | High | Freeze request/response and Redis key first |
| Fullstack scope is too broad | Medium | Backend contract/integration is P0; mobile is lightweight state rendering only |
| Local seed scripts become hidden production assumption | Medium | Mark sample/local only in docs and file names |

## 13. Definition of done

- [ ] Implementation matches §2-§9.
- [ ] All `spec.md` P0/P1 acceptance criteria pass.
- [ ] ML Engineer, Fullstack Engineer, and Data Engineer verification steps pass.
- [ ] PR checklist in `.codex/rules/git.md` §4 passes.
- [ ] Stage 1 local runbook exists and has been smoke-tested.
