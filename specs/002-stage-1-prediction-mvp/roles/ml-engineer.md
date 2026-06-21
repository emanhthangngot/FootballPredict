# Role: ML Engineer — Stage 1 Prediction MVP

> **Spec**: `specs/002-stage-1-prediction-mvp/spec.md`
> **Plan**: `specs/002-stage-1-prediction-mvp/plan.md`
> **Tasks**: `specs/002-stage-1-prediction-mvp/tasks.md`
> **Role rule**: `.codex/rules/team-roles.md`
> **Path rules**: `.codex/rules/python.md`, `.codex/rules/ai-feature.md`

This file is a **role-scoped view** of the canonical spec/plan/tasks. It does **not** redefine requirements; it links to them and elaborates acceptance, deliverables, and verification that this role owns.

---

## 1. Scope (what I own)

- Python `ai_engine` service: feature reader, deterministic baseline inference, score-matrix generator, provenance enforcement.
- Internal AI JSON schema (under `contracts/internal-ai/`) — provenance fields and response shape.
- AI tests covering valid feature, missing feature, provenance enforcement, and reproducibility.
- The `modelVersion` and `trainingDataCutoff` values stamped on every prediction.

## 2. Out of scope (defer to other roles)

- Supabase schema / seed / Redis key materialization — **Data Engineer** (`roles/data-engineer.md`).
- Public BFF endpoint, derivation (total goals / BTTS / edge), ProblemDetails, mobile states — **Fullstack Engineer** (`roles/fullstack-engineer.md`).
- Production-grade model training, calibration dashboards, SHAP explanations — explicitly **non-goal** per `spec.md` §3.
- MLflow / Feast / Qdrant reintroduction — **non-goal** per `spec.md` §3.

## 3. Owned requirements (from `spec.md` §5)

| FR | Why this role owns it | Acceptance anchor |
|---|---|---|
| **FR-2** Python AI reads Redis/sample feature contract (not hard-coded mock) | AI service is in this role's code | `spec.md` §5: AI tests cover valid feature, missing feature, and provenance fields |
| **FR-4** Response includes provenance: `modelVersion`, `featureSnapshotHash`, `trainingDataCutoff` | AI produces the prediction payload | `spec.md` §5: contract and tests fail if provenance is missing |
| **FR-5** Total goals / BTTS derived from score matrix *(inference-side portion: producing the score matrix)* | Score matrix is the AI's output; derivation lives in BFF but the matrix itself comes from here | `spec.md` §5: derivation uses score matrix; ML ensures matrix is normalized |
| **FR-7** OpenAPI/AI schemas reflect Stage 1 contracts *(AI schema portion)* | Internal AI JSON schema is owned by this role | `spec.md` §5: contract validation passes |

## 4. Owned tasks (from `tasks.md`)

| Task | Title | Dependencies I depend on | Tasks that depend on me |
|---|---|---|---|
| **T-1.3** | Freeze AI inference request/response provenance rules | T-1.1, T-1.2 | T-3.1, T-3.2 |
| **T-3.1** | Implement Redis/sample feature reader in `ai_engine` | T-1.2, T-2.1 | T-3.2, T-4.1 |
| **T-3.2** | Replace pure mock output with deterministic baseline inference | T-3.1 | T-4.1, T-6.1, T-6.2 |
| **T-6.2** | Run role-owned verification (AI portion) | T-5.1, T-6.1 | (none) |

**Detailed acceptance (per task):**

### T-1.3 — Freeze AI inference request/response provenance rules
- **Given** the spec mandates provenance in `spec.md` §5 FR-4 and §7 NFR reliability
- **When** I update `contracts/internal-ai/predict.schema.json`
- **Then** the response schema declares these as **required** fields:
  - `modelVersion` — string, semantic version (e.g. `stage1-baseline-poisson-v1`)
  - `featureSnapshotHash` — string, matches the Redis key suffix produced by Data
  - `trainingDataCutoff` — string, ISO-8601 date
  - `scoreMatrix` — array 2D, 6×6 max, values ≥ 0, sum across all 36 cells within `[0.999, 1.001]` (numerical tolerance)
  - `probabilities.homeWin` / `draw` / `awayWin` — float, each ∈ [0, 1], sum within `[0.999, 1.001]`
- **Acceptance**:
  - JSON Schema file validated by CI (existing `validate-schemas` command in repo)
  - **No** response can pass validation without all three provenance fields — `additionalProperties: false` is **not** required, but `required` MUST include the three
- **Files**:
  - `contracts/internal-ai/predict.schema.json` (update)
  - `contracts/internal-ai/predict.request.schema.json` (new or update) — request carries `matchId` and the resolved `featureSnapshotHash`

### T-3.1 — Implement Redis/sample feature reader in `ai_engine`
- **Given** the Redis key shape frozen in T-1.2: `feature:match:{matchId}:snapshot:{featureSnapshotHash}`
- **When** the AI service is called with `{matchId, featureSnapshotHash}`
- **Then**:
  - Reader connects to Redis (host/port from env: `REDIS_HOST`, `REDIS_PORT`)
  - `GET feature:match:{matchId}:snapshot:{featureSnapshotHash}` returns the JSON-serialized feature vector
  - On hit: parse to a typed `FeatureVector` Pydantic model with the **core** fields (per `roles/data-engineer.md` §7)
  - On miss: raise `MissingFeatureError(matchId, featureSnapshotHash)` — BFF maps this to 503 ProblemDetails
- **Files**:
  - `ai_engine/app/feature_reader.py` — class `RedisFeatureReader` with method `read(match_id, snapshot_hash) -> FeatureVector`
  - `ai_engine/app/schemas.py` — Pydantic `FeatureVector` model (core fields only; extended fields ignored for Stage 1)
  - `ai_engine/app/errors.py` — `MissingFeatureError`
- **Tests** (`ai_engine/tests/test_feature_reader.py`):
  - `test_read_returns_typed_vector_for_valid_key` — fixture with seeded Redis key; assert typed return
  - `test_read_raises_missing_feature_for_unknown_match` — assert `MissingFeatureError` with correct `matchId`
  - `test_read_raises_missing_feature_for_unknown_hash` — same with valid `matchId`, unknown hash
  - `test_read_fails_on_malformed_payload` — write bad JSON; assert parse error, **not** silent default
  - `test_read_is_deterministic_across_calls` — call 10×, assert identical bytes

### T-3.2 — Replace pure mock output with deterministic baseline inference
- **Given** the feature reader works and core features are present
- **When** the inference endpoint receives a valid request
- **Then** it returns:
  - **1X2 probabilities** computed from the score matrix marginals (sum of all cells where home > away / equal / away > home)
  - **Score matrix** from the **Poisson goals baseline** (see §6 below for full math)
  - **Provenance** stamped from the request and the model registry (no environment variables for these)
- **Determinism**:
  - Given the same `featureSnapshotHash` and the same `modelVersion`, two calls within 1 hour MUST return byte-identical JSON
  - **No** use of `random`, `time.time()`, `uuid4()`, `datetime.now()` in the inference hot path
- **Files**:
  - `ai_engine/app/baseline.py` — `PoissonBaseline.predict(features: FeatureVector) -> ScoreMatrix` (pure function, no IO)
  - `ai_engine/app/inference.py` — `run_inference(request) -> PredictionResponse` (orchestrates reader → baseline → provenance)
  - `ai_engine/app/provenance.py` — `stamp(model_version, snapshot_hash, training_data_cutoff) -> Provenance` (values come from the **request** or the model registry row, never env-only)
  - `ai_engine/app/main.py` — FastAPI route `POST /internal/v1/predict`
- **Tests** (`ai_engine/tests/test_inference.py`):
  - `test_baseline_returns_normalized_score_matrix` — assert sum ≈ 1.0, all entries ≥ 0, shape 6×6
  - `test_baseline_higher_home_lambda_raises_home_win_prob` — synthetic high `home_attack_strength` → `probabilities.homeWin > probabilities.awayWin`
  - `test_baseline_handles_low_lambda_gracefully` — `lambda < 0.1` does not produce NaN/Inf
  - `test_inference_stamps_provenance_from_request` — given request with `modelVersion=stage1-baseline-poisson-v1`, response carries the same value
  - `test_inference_rejects_request_without_snapshot_hash` — BFF-facing validator returns 422
  - `test_inference_is_byte_deterministic` — same input twice → identical response bytes
  - `test_inference_returns_503_on_missing_feature` — feature reader raises `MissingFeatureError` → response is HTTP 503 with `problem+json`
- **Coverage gate** (per `rules/python.md`): ≥ 80% line coverage on `baseline.py` and `feature_reader.py`. Use `pytest --cov=ai_engine/app/baseline --cov=ai_engine/app/feature_reader --cov-fail-under=80`.

## 5. Owned modules (paths in repo)

- `ai_engine/app/**` — Python source (`feature_reader.py`, `baseline.py`, `inference.py`, `provenance.py`, `schemas.py`, `errors.py`, `main.py`)
- `ai_engine/tests/**` — `pytest` tests for the above
- `ai_engine/pyproject.toml` — dependencies, `pytest` config, coverage gate
- `contracts/internal-ai/**` — JSON schemas (request, response, error)

## 6. Model choice — Poisson goals baseline (chốt với user)

### Math
For a given match with home team H, away team A, league L:

```
λ_home = home_attack_strength(H, L) × away_defense_strength(A, L) × league_avg_goals(L)
λ_away = away_attack_strength(A, L) × home_defense_strength(H, L) × league_avg_goals(L)
```

`scoreMatrix[i][j] = P(home=i, away=j) = Poisson(i; λ_home) × Poisson(j; λ_away)` for `i, j ∈ [0, 5]`.

`Poisson(k; λ) = e^(-λ) × λ^k / k!`

`probabilities.homeWin = Σ_{i>j} scoreMatrix[i][j]`
`probabilities.draw    = Σ_{i==j} scoreMatrix[i][j]`
`probabilities.awayWin = Σ_{i<j} scoreMatrix[i][j]`

### Why Poisson (not Dixon-Coles, not heuristic)
- **Deterministic** — given the same feature vector, output is byte-identical. Mandatory for "deterministic baseline" in `spec.md` §1.
- **Score matrix is a direct output** — satisfies FR-5 "derived from score matrix" without any synthetic reconstruction.
- **Reproducible** — `modelVersion` + `featureSnapshotHash` are the only inputs needed to replay a prediction (per `constitution.md` §2.4).
- **Future-proof** — Stage 2 can swap `PoissonBaseline` for `DixonColesBaseline` behind the same `predict()` interface; contract stays frozen.

### Known limitations (to surface in `docs/ai/stage1_limitations.md`)
- No low-score correction (DC's τ); under-predicts 0-0 / 1-0 / 0-1.
- No team-level correlation; assumes independence of home/away goals.
- No time-decay on form features.
- These are **expected** for a Stage-1 baseline and are labeled in the runbook.

## 7. Cross-role contracts I produce / consume

### I produce
- **Internal AI request schema** (`contracts/internal-ai/predict.request.schema.json`):
  ```json
  {
    "type": "object",
    "required": ["matchId", "featureSnapshotHash"],
    "properties": {
      "matchId":             { "type": "string", "pattern": "^[0-9A-HJKMNP-TV-Z]{26}$" },
      "featureSnapshotHash": { "type": "string" }
    },
    "additionalProperties": false
  }
  ```
- **Internal AI response schema** (`contracts/internal-ai/predict.schema.json`):
  ```json
  {
    "type": "object",
    "required": [
      "modelVersion", "featureSnapshotHash", "trainingDataCutoff",
      "probabilities", "scoreMatrix"
    ],
    "properties": {
      "modelVersion":         { "type": "string" },
      "featureSnapshotHash":  { "type": "string" },
      "trainingDataCutoff":   { "type": "string", "format": "date" },
      "probabilities": {
        "type": "object",
        "required": ["homeWin", "draw", "awayWin"],
        "properties": {
          "homeWin": { "type": "number", "minimum": 0, "maximum": 1 },
          "draw":    { "type": "number", "minimum": 0, "maximum": 1 },
          "awayWin": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      },
      "scoreMatrix": {
        "type": "array",
        "minItems": 6, "maxItems": 6,
        "items": {
          "type": "array", "minItems": 6, "maxItems": 6,
          "items": { "type": "number", "minimum": 0, "maximum": 1 }
        }
      }
    }
  }
  ```
- **Error contract** (BFF consumes): HTTP 503 + `application/problem+json` with `type`, `title`, `status`, `detail`, `matchId`, `featureSnapshotHash` (per RFC 7807).

### I consume
- From **Data Engineer**: the Redis key shape, the JSON shape of the feature vector stored under that key, and the canonical `matchId` + `featureSnapshotHash` example.
- From **Fullstack Engineer**: the request shape (above) and the error contract (above). Any contract drift requires both roles' sign-off on a schema PR.

## 8. Verification (commands + expected output)

```bash
# from ai_engine/
uv sync
uv run pytest -v
# expected: all tests pass; coverage on baseline.py + feature_reader.py ≥ 80%

uv run pytest --cov=ai_engine/app/baseline --cov=ai_engine/app/feature_reader --cov-fail-under=80
# expected: "Required coverage of 80% reached"

# schema validation
# (uses repo's existing contract validation command)
make validate-contracts
# expected: contracts/internal-ai/predict.schema.json — OK
#           contracts/internal-ai/predict.request.schema.json — OK

# lint / type
uv run ruff check ai_engine/
uv run mypy ai_engine/

# smoke run
uv run uvicorn ai_engine.app.main:app --port 8000 &
curl -s -X POST http://127.0.0.1:8000/internal/v1/predict \
  -H 'content-type: application/json' \
  -d '{"matchId":"01JZ8Q8V6K7R4P9A2X3M5N6B7C","featureSnapshotHash":"<hash from data seed>"}' \
  | jq .modelVersion,.featureSnapshotHash,.trainingDataCutoff
# expected: three non-null provenance strings
```

## 9. Definition of done (role-local)

- [ ] `T-1.3`, `T-3.1`, `T-3.2`, AI portion of `T-6.2` are committed and CI green.
- [ ] `uv run pytest` passes from `ai_engine/`; coverage ≥ 80% on the two named modules.
- [ ] `make validate-contracts` (or equivalent) passes for the AI schemas.
- [ ] `uv run ruff check` and `uv run mypy` produce zero issues.
- [ ] No call to `random` / `time.time` / `uuid4` / `datetime.now()` in the inference hot path (grep-gate in CI, see `rules/ai-feature.md`).
- [ ] No `try: ... except: pass` swallow in the inference path (per `rules/python.md`).
- [ ] Every emitted prediction carries all three provenance fields; a test asserts this.

## 10. Risks I own

| Risk | Likelihood | Impact | Mitigation |
|---|:-:|:-:|---|
| Non-determinism creeps in (e.g. `time.time()`) | M | H | CI grep gate; explicit "no clock / no RNG" rule in `pyproject.toml` lint config |
| Score matrix floats sum to 0.9999 or 1.0001 due to rounding and the validator flags it | M | L | Tolerance `[0.999, 1.001]` in schema; normalize at the end of `baseline.predict` |
| `modelVersion` set by env instead of by the request/registry | M | M | `provenance.stamp()` takes it as a required arg; no env fallback |
| Provenance missing in response by mistake | L | H | Schema `required` enforces; test `test_inference_stamps_provenance_from_request` |
| Reader silently uses a default value when feature is missing | L | H | `MissingFeatureError` raised and propagated to BFF; no default branch in reader |
| Baseline quality mistaken for production | M | M | Surface in `docs/ai/stage1_limitations.md`; footer in runbook: "Stage 1 baseline — not production-calibrated" |

## 11. Open questions (to resolve before / during T-1.3 freeze)

- [ ] **`league_avg_goals(L)` source**: hard-code per-league (e.g. `epl: 1.35`) for Stage 1, or read from a config file? — propose **hard-coded dict in `ai_engine/app/config.py`** with a single test asserting each known league is present.
- [ ] **`trainingDataCutoff` value**: literal date for Stage 1 sample (e.g. `2026-06-01`)? — confirm with Data Engineer that this matches `model_registry.training_data_cutoff` for `stage1-baseline-poisson-v1`.
- [ ] **Max goals cap**: 6 (0..5) vs 7 (0..6)? — propose **6×6 (0..5)** because cell mass beyond 5 goals is < 0.5% for typical λ < 2.0; keep it simple for Stage 1.
- [ ] **Poisson implementation**: `math.factorial` loop or `scipy.stats.poisson.pmf`? — propose **`math` only** (no new dep); test asserts scipy is **not** imported in `baseline.py`.
- [ ] **Schema `additionalProperties: false`**: yes or no? — propose **yes** to fail loudly on contract drift; coordinate with Fullstack to ensure no client-side extras sneak in.
- [ ] **Error contract**: 503 + `application/problem+json` only, or also 422 for validation errors? — propose **422** for malformed request (schema-violating), **503** for missing feature / AI unavailable, per `spec.md` §9.
