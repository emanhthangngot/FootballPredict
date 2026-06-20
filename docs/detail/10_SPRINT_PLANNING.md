# 10. SPRINT PLANNING — 18 Weeks

## Sprint Roadmap

| Week | Goal |
|---|---|
| 1–2 | Contract v1, schema draft, docker-compose.local, Supabase/Redis/Airflow setup, mock AI |
| 3–4 | ASP.NET Core prediction module, cache key, Mobile User Home/Fixtures mock data |
| 5–6 | Python baseline inference, Redis feature reader, scoreMatrix contract, totalGoalsDistribution, edge calculation |
| 7–8 | Airflow feature materialization to Redis, prediction_snapshot, scheduled snapshot job draft |
| 9–10 | Timeout/retry/circuit breaker/fallback tests, cache + odds freshness tests, Supabase model registry |
| 11–12 | User MatchDetailScreen, Top Edges, Edge Timeline, Total Goals UI, edgeReliable UI |
| 13–14 | Guided AI chat, SHAP/RAG with pgvector, Feature Breakdown contract, Insight fallback |
| 15–16 | Admin Quality Dashboard, AdminSystemHealth, Simulation async job, OpenTelemetry tracing |
| 17 | Integration hardening, load test, scheduled snapshot validation, model-vs-market report |
| 18 | Final demo, docs, model card, architecture review, CV/portfolio polish |

## Sprint 1 Foundation DoD

```text
Supabase schema created
RLS policy draft exists
Redis available
Airflow LocalExecutor runs one sample DAG
ASP.NET Core API skeleton runs
Python AI mock runs
OpenAPI contract validates
Mobile shell starts on Android target
```

## Sprint 2 DoD

```text
Backend can call Python mock
Fixtures endpoint works
Top Edges mock response works
Mobile Home/Fixtures render mock data
Auth token flow defined
```

## Sprint 3 DoD

```text
Python baseline inference works
Redis feature reader works
scoreMatrix contract exists
Backend derives totalGoalsDistribution
Edge computed from latest odds
```

## Sprint 4 DoD

```text
Airflow materializes Redis features
prediction_snapshot table populated
scheduled snapshot job creates T-24h/T-3h/T-30m samples
```

## Sprint 5+ Focus

- Fallback testing.
- Real mobile UI.
- RAG explanation.
- Admin dashboard.
- Integration hardening.
