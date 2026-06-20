-- FootballPredict architecture foundation schema.
-- Forward-only draft for local review; apply to a clean Supabase/Postgres project first.

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'user',
    display_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT profiles_role_check CHECK (role IN ('user', 'admin', 'system'))
);

CREATE TABLE IF NOT EXISTS public.leagues (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.teams (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fixtures (
    id BIGINT PRIMARY KEY,
    league_id BIGINT REFERENCES public.leagues(id),
    home_team_id BIGINT NOT NULL REFERENCES public.teams(id),
    away_team_id BIGINT NOT NULL REFERENCES public.teams(id),
    kickoff_time TIMESTAMPTZ NOT NULL,
    fixture_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_fixtures_kickoff_time
ON public.fixtures(kickoff_time);

CREATE TABLE IF NOT EXISTS public.odds_snapshot (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES public.fixtures(id),
    provider TEXT NOT NULL,
    snapshot_time TIMESTAMPTZ NOT NULL,
    market TEXT NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_odds_snapshot_match_time
ON public.odds_snapshot(match_id, snapshot_time DESC);

CREATE TABLE IF NOT EXISTS public.gold_match_features_final (
    match_id BIGINT PRIMARY KEY REFERENCES public.fixtures(id),
    fixture_version TEXT NOT NULL,
    league_id BIGINT,
    season TEXT,
    kickoff_time TIMESTAMPTZ NOT NULL,
    feature_snapshot_timestamp TIMESTAMPTZ NOT NULL,
    feature_snapshot_hash TEXT NOT NULL,
    features JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.feature_materialization_registry (
    id BIGSERIAL PRIMARY KEY,
    feature_materialization_id TEXT NOT NULL UNIQUE,
    feature_view_name TEXT NOT NULL,
    snapshot_timestamp TIMESTAMPTZ NOT NULL,
    materialized_at TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    row_count BIGINT,
    source_gold_table TEXT NOT NULL DEFAULT 'gold_match_features_final',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_feature_materialization_active
ON public.feature_materialization_registry(feature_view_name, snapshot_timestamp DESC)
WHERE status = 'SUCCESS';

CREATE TABLE IF NOT EXISTS public.model_version_registry (
    id BIGSERIAL PRIMARY KEY,
    model_version TEXT NOT NULL UNIQUE,
    task TEXT NOT NULL,
    artifact_uri TEXT NOT NULL,
    training_data_cutoff_date DATE NOT NULL,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    status TEXT NOT NULL,
    promoted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT model_version_registry_status_check CHECK (status IN ('candidate', 'active', 'retired'))
);

CREATE INDEX IF NOT EXISTS idx_model_version_registry_active
ON public.model_version_registry(task, promoted_at DESC)
WHERE status = 'active';

CREATE TABLE IF NOT EXISTS public.prediction_snapshot (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES public.fixtures(id),
    checkpoint TEXT NOT NULL,
    model_version TEXT NOT NULL,
    feature_materialization_id TEXT NOT NULL,
    feature_snapshot_hash TEXT NOT NULL,
    training_data_cutoff_date DATE NOT NULL,
    prediction JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(match_id, checkpoint, model_version, feature_materialization_id)
);

CREATE TABLE IF NOT EXISTS public.prediction_serve_event (
    id BIGSERIAL PRIMARY KEY,
    match_id BIGINT NOT NULL REFERENCES public.fixtures(id),
    user_id UUID,
    model_version TEXT NOT NULL,
    feature_materialization_id TEXT NOT NULL,
    feature_snapshot_hash TEXT NOT NULL,
    fallback_used TEXT,
    correlation_id TEXT,
    served_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rag_documents (
    id BIGSERIAL PRIMARY KEY,
    source_type TEXT NOT NULL,
    title TEXT,
    uri TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rag_document_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL REFERENCES public.rag_documents(id),
    chunk_text TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rag_embeddings (
    id BIGSERIAL PRIMARY KEY,
    chunk_id BIGINT NOT NULL REFERENCES public.rag_document_chunks(id),
    embedding VECTOR(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.simulation_jobs (
    id UUID PRIMARY KEY,
    requested_by UUID,
    status TEXT NOT NULL,
    request JSONB NOT NULL,
    result JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ,
    CONSTRAINT simulation_jobs_status_check CHECK (status IN ('queued', 'running', 'completed', 'failed'))
);

CREATE OR REPLACE VIEW public.matches_view
WITH (security_invoker = true) AS
SELECT
    f.id AS match_id,
    f.fixture_version,
    f.kickoff_time,
    f.status,
    ht.name AS home_team,
    at.name AS away_team,
    l.name AS league
FROM public.fixtures f
JOIN public.teams ht ON ht.id = f.home_team_id
JOIN public.teams at ON at.id = f.away_team_id
LEFT JOIN public.leagues l ON l.id = f.league_id;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixtures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.odds_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gold_match_features_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_materialization_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.model_version_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prediction_serve_event ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rag_embeddings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.simulation_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY profiles_self_read
ON public.profiles
FOR SELECT
USING (id = auth.uid());

CREATE POLICY fixtures_authenticated_read
ON public.fixtures
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY matches_view_authenticated_read
ON public.fixtures
FOR SELECT
TO authenticated
USING (true);

-- Domain tables remain server-mediated by default. Backend/system processes use
-- privileged server credentials outside mobile clients.
