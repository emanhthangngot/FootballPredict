# Role: Fullstack Engineer — Stage 1 Prediction MVP

> **Spec**: `specs/002-stage-1-prediction-mvp/spec.md`
> **Plan**: `specs/002-stage-1-prediction-mvp/plan.md`
> **Tasks**: `specs/002-stage-1-prediction-mvp/tasks.md`
> **Role rule**: `.codex/rules/team-roles.md`
> **Path rules**: `.codex/rules/csharp.md`, `.codex/rules/typescript.md`, `.codex/rules/sql.md`

This file is a **role-scoped view** of the canonical spec/plan/tasks. It does **not** redefine requirements; it links to them and elaborates acceptance, deliverables, and verification that this role owns.

---

## 1. Scope (what I own)

- ASP.NET Core BFF endpoint `GET /api/v1/matches/{matchId}/full` (orchestration: fixture + odds + feature metadata + AI call + derived analytics + reliability state).
- Derived analytics: total goals distribution, BTTS, market edge — all computed from the AI's score matrix and the latest odds snapshot.
- ProblemDetails (RFC 7807) responses for invalid `matchId`, unknown fixture, AI unavailable, missing feature, stale data, missing provenance.
- OpenAPI YAML update for the public contract.
- .NET MAUI Match Detail page: 4 explicit states (loading, success, unavailable, stale), BFF-only access.
- Integration test suite for the BFF route.

## 2. Out of scope (defer to other roles)

- Supabase schema, seed/check, Redis feature materialization — **Data Engineer** (`roles/data-engineer.md`).
- AI baseline model, feature reader, inference logic — **ML Engineer** (`roles/ml-engineer.md`).
- Mobile direct Supabase access — explicitly forbidden by `constitution.md` §2.3.
- UI polish beyond basic state rendering — explicitly non-goal per `spec.md` §3 and §5 FR-6.
- Admin dashboard, simulations, scheduled snapshots — non-goal per `spec.md` §3.

## 3. Owned requirements (from `spec.md` §5)

| FR | Why this role owns it | Acceptance anchor |
|---|---|---|
| **FR-3** Backend orchestrates fixture, odds, feature metadata, AI inference, derived analytics | BFF route is in this role's code | `spec.md` §5: backend integration test validates response shape and fallback behavior |
| **FR-5** Total goals / BTTS derived from score matrix *(derivation portion)* | The math that turns a score matrix into total goals + BTTS + edge lives in the BFF | `spec.md` §5: unit tests compare derived values against fixed score matrix input |
| **FR-6** Mobile Match Detail consumes BFF contract; renders loading / success / unavailable / stale | MAUI app is in this role's code | `spec.md` §5: MAUI build passes and manual/local smoke path is documented; no UI polish required |
| **FR-7** OpenAPI reflects Stage 1 contracts *(public contract portion)* | OpenAPI YAML is in this role's tree | `spec.md` §5: contract validation passes |
| **FR-8** Stage 1 remains analytics-only *(mobile copy + BFF error copy)* | User-facing strings live here | `spec.md` §5: disclosure check finds no betting advice language |

## 4. Owned tasks (from `tasks.md`)

| Task | Title | Dependencies I depend on | Tasks that depend on me |
|---|---|---|---|
| **T-0.1** | Create branch `feature/stage1/002-prediction-mvp` from `dev` | none | T-1.1 |
| **T-1.1** | Freeze public and internal Stage 1 contracts | none | T-1.3, T-4.1 |
| **T-4.1** | Implement backend data + AI orchestration for `/api/v1/matches/{matchId}/full` | T-1.1, T-2.1, T-3.2 | T-4.2, T-4.3, T-5.1, T-6.1 |
| **T-4.2** | Implement derived analytics from score matrix | T-4.1 | T-6.1 |
| **T-4.3** | Implement ProblemDetails and reliability/fallback states | T-4.1 | T-5.1, T-6.1 |
| **T-5.1** | Wire MAUI Match Detail to backend Stage 1 contract | T-4.1, T-4.3 | T-6.2 |
| **T-6.1** | Add Stage 1 local runbook (backend + mobile sections) | T-2.1, T-3.2, T-4.1 | T-6.2 |
| **T-6.2** | Run role-owned verification (backend + integration portions) | T-5.1, T-6.1 | (none) |

**Detailed acceptance (per task):**

### T-0.1 — Branch setup
- **Branch name**: `feature/stage1/002-prediction-mvp` (matches `rules/git.md` §1; `<area>` ∈ {backend, mobile, ai, etl, docs, ci, infra} — closest is `feature/stage1/...` which the team has used for cross-area stage branches; if the lint rejects, fall back to `feature/docs/stage1-002-prediction-mvp` and document).
- **Base**: `dev` (per `rules/git.md` §2 and `plan.md` §10).
- **Verify**: `git status --short` is clean before first commit; `git log -1 origin/dev` matches expected tip.

### T-1.1 — Freeze public and internal Stage 1 contracts
- **Given** `spec.md` §8 (data) and §9 (API) define the surface
- **When** I update `contracts/openapi/footballpredict.v1.yaml`
- **Then** the OpenAPI declares:
  - Path `GET /api/v1/matches/{matchId}/full` with `matchId` matching ULID pattern `^[0-9A-HJKMNP-TV-Z]{26}$`
  - Response 200 schema includes: `matchId`, `provider`, `providerMatchId`, `kickoff`, `probabilities`, `scoreMatrix`, `totalGoals`, `btts`, `market`, `edge`, `reliability`, `provenance`
  - Response 404 (invalid matchId / unknown fixture), 422 (validation), 503 (AI / feature unavailable) — all with `application/problem+json`
  - `provenance` is **required** with the same three fields ML Engineer defines (`modelVersion`, `featureSnapshotHash`, `trainingDataCutoff`)
- **Verify**:
  ```bash
  make validate-openapi
  # expected: contracts/openapi/footballpredict.v1.yaml — OK
  ```

### T-4.1 — Backend data + AI orchestration
- **Given** a valid `matchId` and frozen contracts
- **When** the BFF route is called
- **Then** it:
  1. Loads `fixture` (matches row) by `matchId` from Supabase (async, `CancellationToken` default)
  2. Loads latest `odds_snapshot` for the `matchId` (read-only, `AsNoTracking()` per `rules/csharp.md`)
  3. Loads `feature_metadata` row to get `feature_snapshot_hash` and `materialized_at` (for freshness)
  4. Calls `POST /internal/v1/predict` (or in-process client) with `{matchId, featureSnapshotHash}`
  5. **Validates** the AI response: must have all three provenance fields, must have `scoreMatrix` 6×6, must have `probabilities` summing to ≈ 1.0 within tolerance `[0.999, 1.001]`
  6. Calls `Derivation.FromScoreMatrix(...)` (T-4.2) to compute `totalGoals` and `btts`
  7. Calls `Edge.FromProbabilitiesAndMarket(probabilities, market)` to compute `edge`
  8. Builds the public `MatchFullResponse` DTO and returns 200
- **File layout** (per `rules/csharp.md`):
  - `backend/FootballPredictor.Api/Endpoints/Matches.cs` — minimal API endpoint group
  - `backend/FootballPredictor.Api/Application/MatchFullOrchestrator.cs` — handler; `sealed`; `public async Task<MatchFullResponse> HandleAsync(string matchId, CancellationToken ct)`
  - `backend/FootballPredictor.Api/Application/Abstractions/IFixtureReader.cs` + `IOddsReader.cs` + `IFeatureMetadataReader.cs` + `IPredictionClient.cs` (DI-injected)
  - `backend/FootballPredictor.Api/Contracts/MatchFullResponse.cs` — DTO record (one public type per file)
  - `backend/FootballPredictor.Api/Infrastructure/SupabaseFixtureReader.cs` (and siblings) — adapters
- **Test** (`backend/FootballPredictor.Api.Tests/Integration/MatchFullEndpointTests.cs`):
  - `Test1_Get_MatchFull_Returns_200_With_All_Sections` — WebApplicationFactory + Testcontainers Postgres + Redis; seed the canonical row; call endpoint; assert every section present
  - `Test2_Get_MatchFull_Rejects_Non_ULID_MatchId_With_422` — call with `matchId=match-123`; assert 422 ProblemDetails
  - `Test3_Get_MatchFull_Returns_404_For_Unknown_Match` — call with a valid-shape but unknown ULID; assert 404
  - `Test4_Get_MatchFull_Returns_503_When_AI_Unavailable` — kill AI client; assert 503 ProblemDetails
  - `Test5_Get_MatchFull_Rejects_AI_Response_Without_Provenance` — mock IPredictionClient to return a response missing `modelVersion`; assert 503 (not 200)
  - `Test6_Get_MatchFull_Marks_Stale_When_Feature_Metadata_Older_Than_Window` — seed `materialized_at` older than `STAGE1_FRESHNESS_WINDOW_MIN`; assert `reliability.freshnessStatus == "stale"`

### T-4.2 — Derived analytics from score matrix
- **Math** (pure functions, no IO, in `backend/FootballPredictor.Api/Analytics/Derivation.cs`):
  ```csharp
  public static class Derivation
  {
      public static TotalGoalsDistribution TotalGoals(double[,] scoreMatrix) { ... }
      public static double Btts(double[,] scoreMatrix) { ... }
  }
  ```
  - `TotalGoalsDistribution`: map `i+j → k`; probability mass at each `k ∈ [0, 10]`, normalize so it sums ≈ 1.0
  - `Btts`: sum of cells where `i ≥ 1` and `j ≥ 1`
- **Edge** (in `backend/FootballPredictor.Api/Analytics/Edge.cs`):
  ```csharp
  public static class Edge
  {
      // edge_home = model.homeWin - market_implied_home
      // edge_draw = model.draw    - market_implied_draw
      // edge_away = model.awayWin - market_implied_away
      public static MarketEdge FromProbabilitiesAndOdds(Probabilities model, OddsSnapshot market) { ... }
  }
  ```
  - `market_implied = 1 / decimal_odds` per outcome (raw, no margin removal in Stage 1)
- **Tests** (`backend/FootballPredictor.Api.Tests/Unit/DerivationTests.cs`, `EdgeTests.cs`):
  - `Derivation_TotalGoals_For_Fixed_Matrix_Equals_Expected` — fixed 6×6 matrix (e.g. all mass on (1,0), (0,0), (1,1)); assert `TotalGoalsDistribution[0] == scoreMatrix[0,0]`, `[1] == scoreMatrix[0,1] + scoreMatrix[1,0]`, `[2] == scoreMatrix[1,1] + scoreMatrix[0,2] + scoreMatrix[2,0]`
  - `Derivation_Btts_For_All_Zero_Row_And_Column_Is_Zero` — scoreMatrix where `i=0 || j=0` cells sum to 1.0 → `Btts == 0`
  - `Edge_For_Fair_Odds_2_10_3_30_3_30_Equals_Model_Probabilities` — assert `edge ≈ 0` per outcome
  - `Edge_Positive_When_Model_Beats_Market` — model 60% home, market 50% → `edge.homeWin == 0.10`
  - All tests use fixed numeric inputs (no random); tolerance `1e-9` for derived probabilities
- **Performance**: derivation is O(36) — well under 1 ms; no benchmark required for Stage 1.

### T-4.3 — ProblemDetails and reliability/fallback states
- **States** (in `backend/FootballPredictor.Api/Middleware/ProblemDetailsFactory.cs` + an enum):
  | Trigger | HTTP | `type` slug | `reliability.freshnessStatus` |
  |---|:-:|---|---|
  | `matchId` not matching ULID pattern | 422 | `invalid-match-id` | n/a |
  | Fixture not found in DB | 404 | `fixture-not-found` | n/a |
  | AI HTTP 503 / timeout | 503 | `ai-unavailable` | n/a |
  | Missing feature key (`MissingFeatureError` propagated) | 503 | `feature-unavailable` | n/a |
  | AI response missing provenance | 503 | `prediction-missing-provenance` | n/a |
  | `feature_metadata.materialized_at` older than `STAGE1_FRESHNESS_WINDOW_MIN` | 200 | n/a | `"stale"` (with `degradedReason="stale-features"`) |
  | Everything OK | 200 | n/a | `"fresh"` |
- **Reliability DTO** is always present on a 200 response; `freshnessStatus` is `"fresh" | "stale"`; `degradedReason` is `string?`.
- **Tests** (`backend/FootballPredictor.Api.Tests/Integration/MatchFullEndpointTests.cs` — add to T-4.1 file):
  - `Test7_Get_MatchFull_Returns_Stale_Reliability_When_Features_Are_Old` — see T-4.1
  - `Test8_Get_MatchFull_ProblemDetails_Shape_Matches_RFC7807` — assert `Content-Type: application/problem+json`, `type`, `title`, `status`, `detail`, `instance` (with `matchId`); no stack trace
- **Logging** (per `spec.md` §7 NFR observability):
  - Structured `ILogger<MatchFullOrchestrator>` logs at Info / Warn with: `matchId`, `modelVersion`, `featureSnapshotHash`, `trainingDataCutoff`, `freshnessStatus`, `fallbackReason`
  - **No** secrets, **no** `service_role` key, **no** full DTO content

### T-5.1 — MAUI Match Detail — 4 states
- **Given** the BFF contract is frozen
- **When** the mobile user opens a match
- **Then** the page renders exactly one of four states, decided by the BFF response:
  | State | Trigger | UI |
  |---|---|---|
  | `Loading` | request in flight | spinner + "Loading prediction…" |
  | `Success` | 200 with `reliability.freshnessStatus=fresh` | show 1X2, score matrix heatmap, total goals, BTTS, edge |
  | `Unavailable` | 404 or 503 ProblemDetails | show "Analytics unavailable for this match" + disclosure footer |
  | `Stale` | 200 with `reliability.freshnessStatus=stale` | show data + a visible "Data may be outdated" banner |
- **BFF-only** access (per `constitution.md` §2.3): mobile makes **zero** calls to Supabase / Redis / AI directly. The only HTTP client is the BFF base URL.
- **Files**:
  - `frontend/FootballPredictor.Mobile/Pages/MatchDetailPage.xaml` + `.xaml.cs`
  - `frontend/FootballPredictor.Mobile/ViewModels/MatchDetailViewModel.cs` (MVVM; explicit state enum)
  - `frontend/FootballPredictor.Mobile/Api/IMatchApiClient.cs` + `MatchApiClient.cs` — HTTP client, retries disabled (per `rules/typescript.md` keep explicit states)
  - `frontend/FootballPredictor.Mobile/Models/MatchFullResponse.cs` — DTO matching the OpenAPI schema (no `any` — per `rules/typescript.md`/MAUI conventions)
- **Disclosure footer** (per `constitution.md` §2.1): persistent string in `App.xaml` resources: "Analytics & explainable AI. Not betting advice."
- **No UI polish** beyond basic state rendering — `spec.md` §3, §5 FR-6.
- **Verify**:
  ```bash
  dotnet build frontend/FootballPredictor.Mobile/FootballPredictor.Mobile.csproj -f net8.0-android
  # expected: Build succeeded.
  # If no Android SDK / emulator locally: document in runbook the manual smoke steps
  # (open match → see Loading → see Success / Unavailable / Stale)
  ```

### T-6.1 — Local runbook (backend + mobile sections)
- **In** `docs/runbook/stage1.md` (Data Engineer writes the data section; this role writes the backend + mobile sections):
  - **Backend section**:
    - `dotnet run --project backend/FootballPredictor.Api/` (or existing launch profile)
    - `curl http://127.0.0.1:5000/api/v1/matches/01JZ8Q8V6K7R4P9A2X3M5N6B7C/full | jq .`
    - Expected response shape (truncated example)
    - How to interpret 404 / 422 / 503 ProblemDetails
  - **Mobile section**:
    - Open MAUI, navigate to a match, observe the 4 states
    - How to point the MAUI client at the local backend (`appsettings.Development.json` or launchSettings)
- **Disclosure footer** in runbook: "Analytics & explainable AI. Not betting advice."

### T-6.2 — Role-owned verification (backend + integration portions)
- See §8 below for the full command list.

## 5. Owned modules (paths in repo)

- `backend/FootballPredictor.Api/**` — endpoint group, orchestrator, derivation, ProblemDetails middleware, adapters
- `backend/FootballPredictor.Api.Tests/**` — `xUnit` + `FluentAssertions` + `WebApplicationFactory<Program>` + Testcontainers (per `rules/csharp.md`)
- `frontend/FootballPredictor.Mobile/**` — MAUI app
- `contracts/openapi/footballpredict.v1.yaml` — public contract
- `docs/runbook/stage1.md` — backend + mobile sections (data section owned by Data Engineer)

## 6. Cross-role contracts I produce / consume

### I produce
- **Public OpenAPI** (`contracts/openapi/footballpredict.v1.yaml`) — the BFF response shape.
- **BFF consumer contract** for the mobile app — implicit in the OpenAPI above; the MAUI DTO is generated/synchronized from it.
- **Reliability enum values**: `fresh`, `stale` (locked here; mobile renders against these literal strings).

### I consume
- From **Data Engineer** (per `roles/data-engineer.md` §7):
  - `model_registry(model_version, is_active, training_data_cutoff, …)`
  - `feature_metadata(match_id, snapshot_hash, materialized_at, lineage_ref, model_version)`
  - `odds_snapshots(match_id, provider, fetched_at, home_odds, draw_odds, away_odds, market_source)`
  - Redis key `feature:match:{matchId}:snapshot:{featureSnapshotHash}` (the BFF forwards the hash, not the value, to the AI)
- From **ML Engineer** (per `roles/ml-engineer.md` §7):
  - Internal AI request: `{matchId, featureSnapshotHash}`
  - Internal AI response: `modelVersion`, `featureSnapshotHash`, `trainingDataCutoff`, `probabilities`, `scoreMatrix`
  - Error contract: 503 + `application/problem+json` for `MissingFeatureError` and AI unavailable

## 7. Verification (commands + expected output)

```bash
# from repo root

# 1. build
dotnet build backend/FootballPredictor.Api/FootballPredictor.Api.csproj -warnaserror
# expected: Build succeeded. 0 Warning(s). 0 Error(s).

# 2. test
dotnet test backend/FootballPredictor.Api.Tests/FootballPredictor.Api.Tests.csproj
# expected: all green; coverage on Derivation.cs and Edge.cs ≥ 90%

# 3. contract validation
make validate-openapi
make validate-contracts
# expected: contracts/openapi/footballpredict.v1.yaml — OK
#           contracts/internal-ai/predict.schema.json — OK

# 4. format / lint
dotnet format backend/FootballPredictor.Api/ --verify-no-changes

# 5. mobile build
dotnet build frontend/FootballPredictor.Mobile/FootballPredictor.Mobile.csproj -f net8.0-android
# expected: Build succeeded.
# If no Android SDK: document manual smoke in docs/runbook/stage1.md (mobile section)

# 6. disclosure grep (per constitution.md §2.1)
rg -nwi 'tip|bet|stake|odds lock|wager' backend/ frontend/ docs/runbook/stage1.md contracts/openapi/
# expected: no matches (or matches in negating context only — review manually)
```

## 8. Definition of done (role-local)

- [ ] `T-0.1`, `T-1.1`, `T-4.1`, `T-4.2`, `T-4.3`, `T-5.1`, `T-6.1` (backend + mobile sections), backend portion of `T-6.2` are committed and CI green.
- [ ] `dotnet build` passes with `-warnaserror`; `dotnet test` is green.
- [ ] `make validate-openapi` passes.
- [ ] `dotnet format --verify-no-changes` is clean.
- [ ] MAUI Android build passes **or** a documented local smoke note exists in the runbook (per `spec.md` §5 FR-6).
- [ ] No `service_role` key referenced from any mobile-reachable code (grep-gate per `constitution.md` §2.2).
- [ ] No `supabase` / `redis` / `ai_engine` URL referenced from MAUI code (BFF-only per `constitution.md` §2.3).
- [ ] Disclosure footer string is present in `App.xaml` (or equivalent) and in the runbook.
- [ ] Every 200 response carries `provenance` with the three required fields.
- [ ] Every non-200 response is `application/problem+json` matching RFC 7807.
- [ ] PR checklist in `rules/git.md` §4 passes.

## 9. Risks I own

| Risk | Likelihood | Impact | Mitigation |
|---|:-:|:-:|---|
| BFF accidentally calls Supabase with `service_role` from a wrong assembly | L | H | `constitution.md` §2.2 grep-gate; centralized `ISupabaseClient` factory that reads from env only |
| MAUI app reaches for Supabase / Redis directly | M | H | Code review; grep-gate; no `supabase.co` / `redis://` host strings in MAUI project |
| Derivation off-by-one in `TotalGoalsDistribution` (indexing `i+j`) | M | M | Unit test with fixed matrix asserts exact expected distribution |
| Edge calculation uses wrong market-implied formula (raw vs margin-removed) | M | M | Stage 1 = raw `1/odds` only; document; add a TODO in code comment for Stage 2 |
| Stale threshold drift between Data and BFF | M | M | `STAGE1_FRESHNESS_WINDOW_MIN` is a single env var consumed by BFF; Data Engineer's freshness doc references the same value |
| Mobile stale state never rendered because the enum is wrong | L | M | Enum lives in shared DTO, not magic strings; rendering test asserts the literal "stale" string maps to the banner |
| 4xx / 5xx response not ProblemDetails-shaped | M | M | Global exception handler middleware + integration test that asserts RFC 7807 fields |

## 10. Open questions (to resolve before / during T-1.1 freeze)

- [ ] **`STAGE1_FRESHNESS_WINDOW_MIN` default value**: 60 minutes — confirm.
- [ ] **Edge formula**: raw `1/odds` (no overround removal) for Stage 1, or normalized to sum to 1? — propose **raw** for Stage 1 simplicity, **normalized** in Stage 2; document in runbook.
- [ ] **Total goals cap**: max `k = 10` (sum of 5+5). Show only `[0..6]` in the response, or all 11 buckets? — propose **all 11** in the response DTO; mobile chooses how to render.
- [ ] **Reliability enum casing**: `fresh` / `stale` lowercase? — propose **lowercase** to match `problem+json` convention; coordinate with MAUI.
- [ ] **BFF timeout to AI**: 3 seconds total per `spec.md` §7 NFR performance. Use `HttpClient` default timeout 2.5s + 0.5s margin? — propose `HttpClient.Timeout = TimeSpan.FromSeconds(2.5)`.
- [ ] **Branch name lint**: `feature/stage1/...` may not match the `<area>` set in `rules/git.md` §1. If CI rejects, fall back to `feature/docs/stage1-002-prediction-mvp` (the docs area is the umbrella; the rest of the work lands in dedicated feature branches per area).
