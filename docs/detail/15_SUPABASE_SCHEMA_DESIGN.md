# 15. SUPABASE SCHEMA DESIGN

## 1. Supabase Role

Supabase is used for:

```text
Postgres database
Auth
JWT identity
RLS policies
pgvector extension
Optional storage for artifacts later
```

## 2. Auth Model

Roles:

```text
user
admin
system
```

`profiles` table:

```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 3. Important RLS Principles

```text
Users can read public fixture/prediction data through API only.
Mobile should not query business tables directly.
Backend uses service role safely server-side.
Admin endpoints are enforced in ASP.NET Core and optionally with DB policies.
```

## 4. Core Football Tables

```sql
CREATE TABLE teams (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    normalized_name TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE leagues (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE fixtures (
    id BIGSERIAL PRIMARY KEY,
    home_team_id BIGINT REFERENCES teams(id),
    away_team_id BIGINT REFERENCES teams(id),
    league_id BIGINT REFERENCES leagues(id),
    kickoff_time TIMESTAMPTZ NOT NULL,
    fixture_version TEXT NOT NULL,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE match_results (
    fixture_id BIGINT PRIMARY KEY REFERENCES fixtures(id),
    home_goals INT,
    away_goals INT,
    result_1x2 TEXT,
    finished_at TIMESTAMPTZ
);
```

## 5. Odds and Features

```sql
CREATE TABLE odds_snapshot (
    id BIGSERIAL PRIMARY KEY,
    fixture_id BIGINT REFERENCES fixtures(id),
    market_type TEXT NOT NULL,
    selection TEXT NOT NULL,
    decimal_odds NUMERIC(10, 4) NOT NULL,
    implied_probability NUMERIC(10, 6),
    provider TEXT,
    odds_timestamp TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE gold_match_features_final (
    match_id BIGINT PRIMARY KEY,
    fixture_version TEXT NOT NULL,
    league_id BIGINT,
    season TEXT,
    kickoff_time TIMESTAMPTZ NOT NULL,
    feature_snapshot_timestamp TIMESTAMPTZ NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 6. Prediction Tables

```sql
CREATE TABLE prediction_snapshot (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    fixture_version TEXT NOT NULL,
    feature_materialization_id TEXT NOT NULL,
    model_version TEXT NOT NULL,
    snapshot_checkpoint TEXT NOT NULL,
    market_type TEXT NOT NULL,
    model_probabilities JSONB NOT NULL,
    market_implied_probabilities JSONB,
    edge JSONB,
    edge_reliable BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(match_id, fixture_version, feature_materialization_id, model_version, snapshot_checkpoint, market_type)
);

CREATE TABLE prediction_serve_event (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL,
    model_version TEXT,
    market_type TEXT,
    cache_hit BOOLEAN,
    prediction_source TEXT,
    edge JSONB,
    edge_reliable BOOLEAN,
    correlation_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## 7. Model Registry

```sql
CREATE TABLE model_version_registry (
    id BIGSERIAL PRIMARY KEY,
    model_version TEXT NOT NULL UNIQUE,
    model_name TEXT NOT NULL,
    task_type TEXT NOT NULL,
    stage TEXT NOT NULL,
    artifact_uri TEXT NOT NULL,
    metrics JSONB,
    params JSONB,
    is_active BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    promoted_at TIMESTAMPTZ
);
```

## 8. pgvector

```sql
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

Use `rag_embeddings.embedding VECTOR(384)` for MVP.
