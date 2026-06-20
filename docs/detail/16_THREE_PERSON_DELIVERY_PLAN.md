# 16. THREE PERSON DELIVERY PLAN

## 1. Team Structure

| Person | Primary ownership | Secondary |
|---|---|---|
| Person 1 | Backend / Integration / Architecture | Supabase schema, CI |
| Person 2 | Mobile / UI / UX | API client, Admin screens |
| Person 3 | AI / Data / Airflow | ETL, Redis materialization, models |

## 2. Person 1 — Backend / Integration Owner

Responsible for:

```text
ASP.NET Core API
OpenAPI contracts
Supabase JWT verification
Prediction orchestration
PythonAiClient
Redis cache
ModelVersionRegistryCache
Admin APIs
Integration CI
```

## 3. Person 2 — Mobile / UI Owner

Responsible for:

```text
.NET MAUI app
Home/Fixtures/MatchDetail
InsightChat
Admin screens
API client
SecureStorage
UI state for edgeReliable, unavailable sections
```

## 4. Person 3 — AI / Data Owner

Responsible for:

```text
Airflow DAGs
ETL scripts
No-leakage tests
Redis materialization
Baseline models
Python AI Engine
scoreMatrix
SHAP
pgvector RAG
```

## 5. Cross-team Integration Points

| Integration | Owners |
|---|---|
| `/matches/{id}/full` contract | Person 1 + Person 2 + Person 3 |
| Redis feature key shape | Person 1 + Person 3 |
| scoreMatrix schema | Person 1 + Person 3 |
| Feature Breakdown UI | Person 2 + Person 3 |
| Admin Quality Dashboard | Person 1 + Person 2 |
| Supabase schema migrations | Person 1 + Person 3 |

## 6. Delivery Rule

No feature is done until:

```text
Contract updated
Unit tests pass
Integration test added
Mobile state defined
Docs updated
```
