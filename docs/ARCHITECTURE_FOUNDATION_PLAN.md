# Architecture Foundation Plan - FootballPredict

This is the coordination frame for the first architecture implementation pass.
Detailed decisions remain in `docs/detail/*`.

## Goal

Create a working development skeleton so backend, AI/data, and mobile work can proceed in parallel without breaking project boundaries.

## Foundation Outputs

| Area | Output |
|---|---|
| Contracts | Public OpenAPI draft and internal AI prediction schema |
| Backend | ASP.NET Core modular monolith skeleton with health and mock full-match endpoint |
| AI engine | FastAPI internal service with health, mock prediction endpoint, scoreMatrix, and feature breakdown |
| Data/ETL | Supabase schema/RLS draft, Airflow sample DAG, and Redis feature sample payload |
| Infra | Local compose file with backend, AI engine, Redis, and Airflow |
| Security | Client-to-backend boundary preserved; privileged Supabase values stay server-side |
| Observability | Live/ready health endpoints and prediction provenance fields |

## Implementation Slices

1. Contract skeleton: `contracts/openapi` and `contracts/internal-ai`.
2. Backend skeleton: `backend/FootballPredictor.Api`.
3. AI skeleton: `ai_engine/app`.
4. Data skeleton: `supabase/migrations`, `etl/dags`, and `sample-data/redis`.
5. Local runtime: `docker-compose.local.yml`.
6. Mobile shell: `frontend/FootballPredictor.Mobile` after .NET MAUI tooling is available.

## Done Criteria

```text
The backend exposes /health/live, /health/ready, and /api/v1/matches/{matchId}/full.
The AI engine exposes /internal/v1/health and /internal/v1/predict.
The mock prediction response includes model version, feature materialization id, feature snapshot hash, and training cutoff.
The Supabase foundation migration includes RLS draft policies and pgvector.
The contract files describe the same runtime boundary as the code skeleton.
The local stack can be started once Docker and .NET tooling are available.
```

## Immediate Next Tasks

| Priority | Task |
|---|---|
| P0 | Enable .NET SDK locally, then run `dotnet build backend/FootballPredictor.Api/FootballPredictor.Api.csproj`. |
| P0 | Install Python dependencies, then run AI tests. |
| P0 | Replace backend mock services with Supabase/Redis/AI integrations incrementally. |
| P1 | Validate Supabase migration on a clean local database. |
| P1 | Add the .NET MAUI shell in `frontend/FootballPredictor.Mobile`. |
