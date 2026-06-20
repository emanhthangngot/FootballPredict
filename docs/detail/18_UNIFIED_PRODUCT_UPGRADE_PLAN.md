# 18. UNIFIED PRODUCT UPGRADE PLAN

## 1. Upgrade Direction

This plan upgrades the product from a simple prediction demo into a mobile analytics platform.

Key upgrade themes:

```text
Mobile-first UX
Contract-first backend
Lightweight local stack
Supabase Postgres central data store
Redis online features
Airflow scheduled jobs
pgvector RAG
Admin quality validation
```

## 2. Phase 1 — Foundation

```text
Repo structure
Supabase schema
ASP.NET Core skeleton
Python AI mock
Redis setup
Airflow LocalExecutor
OpenAPI contract
Mobile shell
```

## 3. Phase 2 — Prediction MVP

```text
Fixtures
Top Edges
/matches/{id}/full
Redis feature materialization
Baseline model inference
scoreMatrix
Total Goals Distribution
BTTS
Edge calculation
```

## 4. Phase 3 — Quality and Snapshots

```text
prediction_snapshot
scheduled snapshots T-24h/T-3h/T-30m
calibration metrics
model vs market benchmark
Admin Quality Dashboard
```

## 5. Phase 4 — Explainability

```text
SHAP Feature Breakdown
pgvector RAG
Guided AI Chat
Insight fallback
Prompt injection guard
```

## 6. Phase 5 — Admin and Hardening

```text
AdminSystemHealth
Simulation Lab
OpenTelemetry
Load tests
CI hardening
Model card
Final demo
```

## 7. Future Upgrade Options

```text
Dedicated Feast if feature serving scale grows
Dedicated Qdrant if RAG scale grows
MLflow Server if experiment tracking becomes complex
GNN model
Multi-market Edge Timeline
Champion/challenger UI
```
