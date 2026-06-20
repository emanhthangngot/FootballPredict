# 13. DEVELOPMENT INFRASTRUCTURE

## 1. Monorepo Structure

Use:

```text
.github/
ai_engine/
backend/
benchmark_result/
docs/
etl/
frontend/
notebooks/
scripts/
.env.example
docker-compose.local.yml
```

## 2. Local Runtime

Recommended for 16GB RAM:

```text
Hosted Supabase for Auth + Postgres
Local Redis
Local Airflow
Local Backend
Local Python AI Engine
```

Optional offline:

```text
Local Postgres + pgvector mirror
```

## 3. RAM Budget

| Service | Memory Limit |
|---|---:|
| Airflow Webserver + Scheduler | 2.5GB |
| Python AI Engine | 2.5GB |
| Local Postgres + pgvector if used | 1.5GB |
| Redis | 512MB |
| ASP.NET Core Backend | 512MB |

## 4. Airflow Local Mode

```text
Executor: LocalExecutor
Mount source:
  ./etl
  ./ai_engine
  ./scripts
```

No CeleryExecutor for local.

## 5. Environment Variables

```env
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=

REDIS_CONNECTION_STRING=
PYTHON_AI_BASE_URL=

AIRFLOW__CORE__EXECUTOR=LocalExecutor
```

Service-role key must only be used server-side.

## 6. docker-compose.local.yml

Should include:

```text
backend
ai_engine
redis
airflow-webserver
airflow-scheduler
optional local-postgres
```

Not included:

```text
Feast
Qdrant
MLflow Server
```
