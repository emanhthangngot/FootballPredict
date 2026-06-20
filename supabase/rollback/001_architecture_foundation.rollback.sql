-- Development rollback only. Do not run against shared or production data.

DROP VIEW IF EXISTS public.matches_view;
DROP TABLE IF EXISTS public.simulation_jobs;
DROP TABLE IF EXISTS public.rag_embeddings;
DROP TABLE IF EXISTS public.rag_document_chunks;
DROP TABLE IF EXISTS public.rag_documents;
DROP TABLE IF EXISTS public.prediction_serve_event;
DROP TABLE IF EXISTS public.prediction_snapshot;
DROP TABLE IF EXISTS public.model_version_registry;
DROP TABLE IF EXISTS public.feature_materialization_registry;
DROP TABLE IF EXISTS public.gold_match_features_final;
DROP TABLE IF EXISTS public.odds_snapshot;
DROP TABLE IF EXISTS public.fixtures;
DROP TABLE IF EXISTS public.teams;
DROP TABLE IF EXISTS public.leagues;
DROP TABLE IF EXISTS public.profiles;
