# Role: Data Engineer — Stage 1 Prediction MVP

> **Spec**: `specs/002-stage-1-prediction-mvp/spec.md`
> **Plan**: `specs/002-stage-1-prediction-mvp/plan.md`
> **Tasks**: `specs/002-stage-1-prediction-mvp/tasks.md`
> **Role rule**: `.codex/rules/team-roles.md`
> **Path rules**: `.codex/rules/sql.md`, `.codex/rules/python.md`

This file is a **role-scoped view** of the canonical spec/plan/tasks. It does **not** redefine requirements; it links to them and elaborates acceptance, deliverables, and verification that this role owns.

---

## 1. Scope (what I own)

- Local Supabase-compatible Postgres schema for Stage 1 sample data (fixture, odds, model registry, feature metadata, audit).
- Forward-only migrations (additive only; no destructive alters on existing foundation tables).
- Idempotent deterministic seed/check scripts.
- Redis feature key materialization with deterministic `featureSnapshotHash`.
- Freshness & lineage metadata exposed for ML and BFF to read.
- Local runbook (data section) — startup, seed, check, Redis key verification.

## 2. Out of scope (defer to other roles)

- AI baseline model & inference logic — **ML Engineer** (`roles/ml-engineer.md`).
- Public BFF endpoint, derivation, ProblemDetails — **Fullstack Engineer** (`roles/fullstack-engineer.md`).
- MAUI client states — **Fullstack Engineer**.
- **Airflow DAGs**: deferred to **Stage 2** (see `.codex/rules/team-roles.md` and `plan.md` §3). Stage 1 uses ad-hoc deterministic seed scripts; Airflow is **not** in scope for this spec.

## 3. Owned requirements (from `spec.md` §5)

| FR | Why this role owns it | Acceptance anchor |
|---|---|---|
| **FR-1** Local sample data exists (fixture, odds, feature vector, active model version) | Data Engineer produces the data | `spec.md` §5: seed/check script can load and verify deterministic rows/keys with ULID internal `matchId` and provider external id |
| **FR-7** OpenAPI/AI schemas reflect Stage 1 contracts *(data-side portion)* | Data Engineer owns the underlying table schema referenced by the public contract | `spec.md` §5: contract validation passes (data-shape portion) |
| **FR-8** Stage 1 remains analytics-only *(disclosure copy in runbook/docs)* | Data Engineer writes the runbook/docs the user reads | `spec.md` §5: disclosure check finds no betting advice language |

## 4. Owned tasks (from `tasks.md`)

| Task | Title | Dependencies I depend on | Tasks that depend on me |
|---|---|---|---|
| **T-1.2** | Freeze Redis feature key and feature vector fields | none | T-1.3, T-2.1, T-3.1 |
| **T-2.1** | Add deterministic Stage 1 sample seed/check path | T-1.2 | T-2.2, T-3.1, T-4.1, T-6.1 |
| **T-2.2** | Add minimal forward migration only if foundation schema cannot support Stage 1 | T-2.1 | T-4.1 |
| **T-6.1** | Add Stage 1 local runbook (data section + smoke) | T-2.1, T-3.2, T-4.1 | T-6.2 |

**Detailed acceptance (per task):**

### T-1.2 — Freeze Redis feature key and feature vector fields
- **Given** the spec lists the contract fields in `spec.md` §8 and §9
- **When** I document the key shape and field list
- **Then**:
  - Redis key shape recorded: `feature:match:{matchId}:snapshot:{featureSnapshotHash}` (`spec.md` §8)
  - Sample key derivable from `matchId=01JZ8Q8V6K7R4P9A2X3M5N6B7C` and `featureSnapshotHash` (deterministic, e.g. SHA-256 of the serialized feature vector, hex-short)
  - Feature vector fields split into **core** (used by ML Stage 1) and **extended** (materialized but `modelVersion` flagged "unused" in registry; available for Stage 2/3)
- **Acceptance files**:
  - `docs/runbook/stage1.md` section "Data" → "Feature key & vector"
  - `etl/README.md` → "Feature key shape"
- **Verify**: a human can construct the key by hand from the example in `spec.md` §8 and the hash in the runbook.

### T-2.1 — Add deterministic Stage 1 sample seed/check path
- **Given** the canonical match identity from `spec.md` §8:
  ```text
  matchId: 01JZ8Q8V6K7R4P9A2X3M5N6B7C
  provider: sample
  providerMatchId: sample-epl-2026-08-15-ars-che
  ```
- **When** I run the seed script in a clean local DB+Redis
- **Then** the script:
  - Inserts exactly **1** row into `matches` (or equivalent foundation table) with internal ULID + provider fields
  - Inserts exactly **1** row into `odds_snapshots` keyed by `matchId` with `fetched_at` timestamp
  - Inserts exactly **1** row into `model_registry` with `model_version=stage1-baseline-poisson-v1`, `is_active=true`
  - Inserts exactly **1** row into `feature_metadata` with deterministic `feature_snapshot_hash`
  - Writes exactly **1** Redis key `feature:match:01JZ8Q8V6K7R4P9A2X3M5N6B7C:snapshot:<hash>` with a JSON value containing the feature vector (core + extended)
- **Idempotency**: re-running the script is a no-op (no duplicate rows, key value unchanged). Use `ON CONFLICT DO NOTHING` for inserts and `SET ... NX` for Redis.
- **Deliverables**:
  - `etl/seed/stage1_seed.py` — pure function `seed(conn, redis) -> SeedReport`
  - `etl/seed/stage1_check.py` — pure function `check(conn, redis) -> CheckReport`, exits non-zero on mismatch
  - `etl/seed/expected.json` — expected counts and expected key shape (used by `check` and by tests)
- **Acceptance tests**:
  - `etl/tests/test_stage1_seed.py::test_seed_is_idempotent` — run seed twice, assert `actual_rows == expected_rows`
  - `etl/tests/test_stage1_seed.py::test_seed_uses_ulid_match_id` — assert inserted row's `match_id` equals the canonical ULID
  - `etl/tests/test_stage1_check.py::test_check_exits_zero_on_clean_seed` — run check, assert exit code 0 and report contains `expected_rows=1, actual_rows=1, redis_key=feature:match:01JZ8Q...:snapshot:...`
  - `etl/tests/test_stage1_check.py::test_check_fails_on_missing_row` — delete a row, re-run check, assert exit code ≠ 0
- **Verify**:
  ```bash
  python etl/seed/stage1_check.py
  # expected stdout: {"expected_rows":1,"actual_rows":1,"redis_key":"feature:match:01JZ8Q8V6K7R4P9A2X3M5N6B7C:snapshot:..."}
  # expected exit code: 0
  ```

### T-2.2 — Add minimal forward migration only if foundation schema cannot support Stage 1
- **Given** existing foundation schema in `supabase/migrations/`
- **When** the schema lacks any required column/table for Stage 1
- **Then** I add a single forward-only migration: `supabase/migrations/<YYYYMMDDHHMMSS>_stage1_sample.sql`
- **Migration must**:
  - Be **additive only** (no `DROP`, no `ALTER ... DROP COLUMN`, no type narrowing). Per `rules/sql.md`: forward-only.
  - Include `IF NOT EXISTS` guards where the tool allows
  - Add `NOT NULL` columns with safe defaults
  - Add indexes on `(match_id, fetched_at)` for `odds_snapshots` and `(match_id, model_version)` for `model_registry`
  - Add a `feature_metadata(match_id, snapshot_hash, materialized_at, lineage_ref)` table if missing
- **No RLS changes** (default-deny stays default-deny; mobile does not read these tables directly — per `constitution.md` §2.3).
- **Verify**:
  ```bash
  # apply on a clean DB
  psql "$DATABASE_URL" -f supabase/migrations/<ts>_stage1_sample.sql
  # apply on a DB with existing foundation rows — must not error
  ```
- **Rollback note** in the runbook only (development rollback; production rollback is out of scope for Stage 1 — no production deploy per `spec.md` §3).

### T-6.1 — Add Stage 1 local runbook (data section)
- **Section "Data"** in `docs/runbook/stage1.md` covers:
  - Startup of local Supabase-compatible Postgres + Redis (compose snippet or `pg_ctl`/`redis-server` command list)
  - Migration apply command
  - Seed command + expected output
  - Check command + how to interpret non-zero exit
  - Redis key shape with the canonical example
  - Freshness rule: `feature_metadata.materialized_at` newer than `odds_snapshots.fetched_at` by ≤ `STAGE1_FRESHNESS_WINDOW_MIN` (default 60) → `freshness_status="fresh"`; else `"stale"`
  - Lineage: each row of `feature_metadata` carries a `lineage_ref` that points to the source snapshot id(s) used
  - Disclosure footer text: "Analytics & explainable AI. Not betting advice." (per `constitution.md` §2.1)

## 5. Owned modules (paths in repo)

- `supabase/migrations/**` — schema migrations (additive only)
- `etl/seed/**` — seed/check scripts and expected JSON
- `etl/tests/**` — Python tests for seed/check
- `docs/runbook/stage1.md` — data section (also written by Fullstack for their sections; coordination via PR review)

## 6. Deliverables (concrete artifacts)

| Path | Purpose |
|---|---|
| `supabase/migrations/<ts>_stage1_sample.sql` | Forward-only Stage 1 migration (only if needed) |
| `etl/seed/stage1_seed.py` | Idempotent deterministic seed |
| `etl/seed/stage1_check.py` | Verification exit-0 script |
| `etl/seed/expected.json` | Expected row counts + key shape |
| `etl/tests/test_stage1_seed.py` | Seed tests (idempotency, ULID) |
| `etl/tests/test_stage1_check.py` | Check tests (exit codes, mismatch detection) |
| `docs/runbook/stage1.md` | Data section: startup, seed, check, Redis key, freshness, lineage, disclosure |

## 7. Cross-role contracts I produce / consume

### I produce
- **Redis key shape**: `feature:match:{matchId}:snapshot:{featureSnapshotHash}` (canonical, documented in runbook; `spec.md` §8).
- **Feature vector schema** (JSON, stored in Redis value):
  - **Core** (consumed by ML Stage 1):
    | field | type | notes |
    |---|---|---|
    | `home_attack_strength` | float | league-relative |
    | `home_defense_strength` | float | league-relative |
    | `away_attack_strength` | float | league-relative |
    | `away_defense_strength` | float | league-relative |
    | `home_form_5` | float | avg points last 5 |
    | `away_form_5` | float | avg points last 5 |
    | `h2h_home_win_rate` | float | [0,1] |
    | `rest_days_home` | int | ≥0 |
    | `rest_days_away` | int | ≥0 |
    | `league_id` | string | e.g. `epl` |
  - **Extended** (materialized, marked `unused` in `model_registry` for Stage 1; ready for Stage 2/3 without re-migration):
    `venue`, `weather_condition`, `temperature_c`, `humidity_pct`, `referee_id`, `home_lineup_strength`, `away_lineup_strength`, `home_injury_count`, `away_injury_count`, `home_xg_per90`, `away_xg_per90`, `home_xga_per90`, `away_xga_per90`, `market_implied_home`, `market_implied_draw`, `market_implied_away`, `travel_distance_km`, `altitude_m`, `derby_flag`.
- **Public-readable tables** (RLS: read-only for the BFF service role; mobile never reads these — `constitution.md` §2.3):
  - `model_registry(model_version, is_active, training_data_cutoff, created_at)`
  - `feature_metadata(match_id, snapshot_hash, materialized_at, lineage_ref, model_version)`
  - `odds_snapshots(match_id, provider, fetched_at, home_odds, draw_odds, away_odds, market_source)`

### I consume
- From **Fullstack Engineer**: nothing in Stage 1 data path (BFF is downstream of me).
- From **ML Engineer**: confirmation that core feature list is sufficient (T-1.3 freezes the provenance contract; T-3.1 confirms feature reader works against my key).

## 8. Verification (commands + expected output)

```bash
# 1. apply migrations on clean local DB
psql "$DATABASE_URL" -f supabase/migrations/<ts>_stage1_sample.sql
# expected: CREATE TABLE / ALTER TABLE statements succeed

# 2. seed
python etl/seed/stage1_seed.py
# expected: deterministic, no random output; exits 0

# 3. check
python etl/seed/stage1_check.py
# expected stdout: {"expected_rows":1,"actual_rows":1,"redis_key":"feature:match:01JZ8Q8V6K7R4P9A2X3M5N6B7C:snapshot:<hash>"}
# expected exit code: 0

# 4. test
python -m pytest etl/tests/ -v
# expected: all green

# 5. ruff / mypy (per rules/python.md)
python -m ruff check etl/
python -m mypy etl/
```

## 9. Definition of done (role-local)

- [ ] `T-1.2`, `T-2.1`, `T-2.2`, `T-6.1` (data section) are committed and CI green.
- [ ] `python etl/seed/stage1_check.py` exits 0 on a clean seed.
- [ ] Re-running `stage1_seed.py` produces no duplicates and no Redis key drift.
- [ ] `docs/runbook/stage1.md` exists and contains the data section with the canonical example key.
- [ ] No `DROP` / non-additive migration in `supabase/migrations/`.
- [ ] No service-role key committed; no mobile direct read path added.
- [ ] Disclosure footer string present in `docs/runbook/stage1.md`.
- [ ] Disclosure grep on touched files finds no `tip` / `bet` / `stake` / `odds lock` per `constitution.md` §2.1.

## 10. Risks I own

| Risk | Likelihood | Impact | Mitigation |
|---|:-:|:-:|---|
| Foundation schema lacks a required column → forced schema change | M | M | T-2.2 already scoped as minimal forward-only; coordinate with Fullstack on the contract first |
| Redis key shape drifts between seed and ML reader | M | H | T-1.2 freeze + T-1.3 dependency; both reference same `spec.md` §8 |
| Non-deterministic `featureSnapshotHash` breaks reproducibility | L | H | Hash is `sha256(canonical_json(feature_vector))`; canonical JSON = sorted keys, no whitespace, fixed number format |
| Seed script accidentally inserts duplicates under partial failure | M | M | Wrap insert+Redis-write in a single transaction; rollback Redis on DB failure |
| Disclosure copy in runbook drifts toward betting language | L | M | Disclosure grep in CI; final PR review |

## 11. Open questions (to resolve before / during T-1.2 freeze)

- [ ] **Hash algorithm**: SHA-256 hex (first 16 chars) or full hex? — propose **first 16 hex of sha256** for readability, document in runbook.
- [ ] **Feature vector encoding**: full nested JSON or flat key-value with type tags? — propose **flat object, sorted keys, numbers as fixed-point strings** to keep hash stable.
- [ ] **Freshness window default**: 60 minutes — confirm or set another value.
- [ ] **`lineage_ref` content**: pointer to source odds snapshot id and model_version — confirm with ML Engineer that this is enough for provenance cross-check.
- [ ] **Sample data lifespan**: keep sample row forever or auto-purge after Stage 2 lands? — propose **keep** until Stage 2 ships its own seed (deterministic, low volume).
