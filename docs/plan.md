# 00. MASTER PRODUCT PLAN + TDD + SDD — Football Match Predictor

> **Project:** Football Match Predictor  
> **Client:** .NET MAUI Mobile App  
> **Backend:** ASP.NET Core Modular Monolith  
> **AI Engine:** Python FastAPI internal service  
> **Database:** Supabase Postgres + pgvector  
> **Auth:** Supabase Auth  
> **Cache / Online Features:** Redis  
> **Workflow Orchestration:** Apache Airflow  
> **Removed for lightweight local stack:** Feast, Qdrant, MLflow Server  
> **Purpose:** File chung dùng làm baseline chính thức cho implementation.

---

## 1. Product Vision

Football Match Predictor là một **football analytics mobile app** dùng Machine Learning, Data Engineering và Explainable AI để trả lời:

```text
Model dự đoán gì?
Model khác market benchmark ở đâu?
Model tự tin đến đâu?
Vì sao model đưa ra prediction đó?
Prediction và dữ liệu có còn fresh không?
Model có thật sự đáng tin hơn market không?
```

Sản phẩm được định vị là **analytics / research / educational platform**, không phải app khuyến khích cá cược.

---

## 2. Product Surfaces

### User Surface

User chỉ dùng các tính năng phân tích:

- Home dashboard.
- Fixtures list.
- Top Edges.
- Match Detail.
- Edge Timeline.
- Correct Score Heatmap.
- Total Goals Distribution.
- BTTS.
- Feature Breakdown.
- Guided AI Match Chat.

### Admin Surface

Admin dùng để kiểm định và vận hành:

- Model Quality Dashboard.
- Calibration Dashboard.
- Snapshot Quality.
- Data Freshness.
- Model vs Market Benchmark.
- Simulation Lab.
- System Health.
- Model Version Summary.

---

## 3. Final Architecture

```text
.NET MAUI Mobile App
        ↓ HTTPS
ASP.NET Core Backend API
        ↓ internal HTTP
Python AI Engine
        ↓
Redis + Supabase Postgres + pgvector
        ↑
Apache Airflow DAGs
        ↑
Python ETL / Feature Engineering / Snapshot / Training Jobs
```

### Kept

| Tool | Role |
|---|---|
| Supabase Postgres | Main database, schemas, pgvector, model registry, prediction logs |
| Supabase Auth | User/Admin/System auth source |
| Redis | Online features, model prediction cache, short-lived runtime cache |
| Apache Airflow | DAG orchestration, retries, scheduling, dependency graph |
| ASP.NET Core | Public API, BFF, validation, caching, fallback, auth |
| Python AI Engine | Inference, SHAP, scoreMatrix, RAG |
| .NET MAUI | Mobile app |

### Removed

| Removed | Replacement |
|---|---|
| Feast | Supabase Postgres offline features + Redis online features |
| Qdrant | Supabase Postgres + pgvector |
| MLflow Server | `model_version_registry` table in Supabase Postgres |

---

## 4. TDD — Technical Design Document

### 4.1 Runtime Components

| Component | Responsibility |
|---|---|
| .NET MAUI Mobile | UI rendering, navigation, SecureStorage token, API calls |
| ASP.NET Core API | Public API, JWT verification, role checks, prediction orchestration |
| Python AI Engine | Model inference, scoreMatrix, SHAP, RAG retrieval/generation |
| Redis | Online features and prediction cache |
| Supabase Postgres | Persistent business data, prediction snapshots, pgvector, model registry |
| Supabase Auth | Sign-in, JWT issuance, user identity |
| Airflow | ETL DAGs, feature materialization, scheduled snapshots, retraining |
| GitHub Actions | CI, tests, contract validation, scheduled training workflow |

### 4.2 Critical Runtime Flow

```text
Mobile
  → GET /api/v1/matches/{matchId}/full
  → ASP.NET Core loads fixture + latest odds from Supabase Postgres
  → ASP.NET Core loads active feature materialization metadata
  → ASP.NET Core checks Redis model_prediction cache
  → cache miss: ASP.NET Core calls Python AI Engine
  → Python reads online feature key from Redis
  → Python returns 1X2 ensemble output + scoreMatrix + SHAP if requested
  → ASP.NET Core validates core output
  → ASP.NET Core derives totalGoalsDistribution and BTTS from scoreMatrix
  → ASP.NET Core computes fresh market implied probability and edge
  → ASP.NET Core enqueues audit log best-effort
  → Mobile renders response
```

### 4.3 Key Technical Rules

| Rule | Decision |
|---|---|
| Edge | Never cache final edge. Recompute from latest odds on each request |
| MLflow | Removed. No MLflow call on hot path |
| Feature serving | Python reads Redis online features |
| Feature metadata | ASP.NET Core reads Supabase Postgres registry |
| Vector search | pgvector in Supabase Postgres |
| ScoreMatrix failure | Do not fail 1X2 if core prediction is valid |
| Simulation | Admin-only, async, educational/research only |
| Airflow local | Mount source code directly, LocalExecutor |
| Production later | ETL image can be introduced later |

### 4.4 Non-functional Requirements

| Area | Requirement |
|---|---|
| Latency | `/matches/{id}/full` target < 3s |
| Reliability | Fallback chain: fresh cache → stale cache warning → market-implied → 503 |
| Observability | Metrics for latency, fallback, stale features, unknown model version |
| Security | Supabase JWT verification, role-based authorization |
| Data correctness | No leakage; features for match T only use data before T |
| Maintainability | Contract-first, module boundaries, tests per service |
| Local resource | Keep Docker stack near 7–8GB RAM on 16GB machine |

---

## 5. SDD — Software Design Document

### 5.1 Backend Module Design

```text
backend/FootballPredictor.Api/
├── Modules/
│   ├── Auth/
│   ├── Fixtures/
│   ├── Predictions/
│   ├── Insights/
│   ├── AdminQuality/
│   ├── Simulation/
│   └── AdminOps/
├── Application/
├── Infrastructure/
│   ├── Persistence/
│   ├── SupabaseAuth/
│   ├── PythonAiClient/
│   ├── FeatureMetadata/
│   ├── ModelRegistry/
│   ├── Caching/
│   ├── AuditLogging/
│   └── SimulationJobs/
└── Observability/
```

### 5.2 Backend Service Interfaces

| Service | Responsibility |
|---|---|
| `PredictionOrchestrator` | Coordinates fixture, odds, cache, AI call, validation |
| `PythonAiClient` | Internal HTTP client to Python AI Engine |
| `MarketOddsService` | Loads latest odds and computes implied probability |
| `EdgeCalculator` | Computes edge and edgeReliable |
| `ModelPredictionCache` | Redis cache for model probability and score outputs |
| `FeatureMetadataService` | Reads feature materialization registry from Supabase |
| `ModelVersionRegistryCache` | Refreshes active model versions from Supabase every 5 minutes |
| `PredictionAuditQueue` | Best-effort async logging |
| `AdminQualityService` | Aggregates calibration, log loss, Brier score |
| `SimulationJobService` | Creates and tracks async simulations |

### 5.3 Python AI Engine Design

```text
ai_engine/
├── app/
│   ├── api/
│   ├── services/
│   │   ├── inference_service.py
│   │   ├── redis_feature_reader.py
│   │   ├── shap_service.py
│   │   ├── rag_pgvector_service.py
│   │   └── score_matrix_service.py
│   └── schemas/
├── models/
├── explainability/
└── rag/
```

| Service | Responsibility |
|---|---|
| `RedisFeatureReader` | Reads online feature JSON from Redis |
| `InferenceService` | Loads active model artifacts and predicts |
| `ScoreMatrixService` | Produces Dixon-Coles scoreMatrix |
| `ShapService` | Produces top feature attribution |
| `RagPgvectorService` | Retrieves context from Supabase pgvector |
| `AnswerGenerator` | Generates guided explanation with guardrails |

### 5.4 Mobile Design

```text
frontend/FootballPredictor.Mobile/
├── Views/
│   ├── User/
│   └── Admin/
├── ViewModels/
├── Services/
├── Models/
└── Components/
```

Main components:

- `ProbabilityBar`.
- `EdgeBadge`.
- `EdgeTimelineChart`.
- `ScoreHeatmap`.
- `TotalGoalsDistributionChart`.
- `FeatureBreakdownCard`.
- `AdminHealthStatusCard`.

### 5.5 Dependency Direction Rules

```text
Mobile → Backend API
Backend API → Python AI Engine
Backend API → Supabase Postgres
Backend API → Redis
Python AI Engine → Redis
Python AI Engine → Supabase Postgres / pgvector
Airflow → Supabase Postgres
Airflow → Redis
```

Forbidden:

- Mobile must not call Supabase tables directly for business data.
- Mobile must not hold Supabase service-role key.
- Python AI Engine must not issue user JWT.
- Airflow must not serve user requests.
- Backend must not run model training.
- Backend must not call MLflow because MLflow is removed.

---

## 6. Validation & Mismatch Rules

Core prediction errors reject whole response:

```text
matchId mismatch → Reject 502
fixtureVersion mismatch → Reject 502
featureMaterializationId mismatch → Reject 502
unknown modelVersion → Reject 502
1X2 probability sum invalid → Reject 502
conformal empty set in MVP → Reject 502
core 1X2 malformed → Reject 502
```

Score component errors do not break 1X2:

```text
scoreMatrix missing → score model fallback
scoreMatrix sum invalid → score model fallback + quality alert
scoreMatrix tail mass too large → warning or fallback
```

---

## 7. Graceful Degradation

Prediction fallback priority:

```text
1. Fresh model prediction cache
2. Stale model prediction cache with warning
3. Market-implied fallback for RESULT_1X2
4. 503 if no usable cache or odds
```

Score model fallback:

```text
Return 1X2 prediction.
Hide Correct Score Heatmap.
Hide Total Goals Distribution.
Hide BTTS.
Set scoreDistributionUnavailable: true.
Log score_distribution_unavailable_total.
```

Insight fallback:

```text
If insight fails inside /matches/{id}/full:
  return prediction and set insightUnavailable: true.

If standalone /insights/ask fails:
  return safe 503 unavailable message.
```

---

## 8. Testing Strategy

### TDD Implementation Rule

Each feature should be implemented in this order:

```text
1. Write contract/schema first.
2. Write failing unit test.
3. Implement minimal service logic.
4. Add integration test.
5. Add fallback/error test.
6. Connect mobile UI after API contract is stable.
```

### Required Tests

| Layer | Tests |
|---|---|
| Backend unit | EdgeCalculator, OddsConverter, ValidationRules, CacheKeyBuilder |
| Backend integration | `/matches/{id}/full`, fallback chain, auth roles |
| AI unit | scoreMatrix, Redis feature reader, SHAP output, RAG retriever |
| ETL tests | no leakage, rolling features shift, Redis materialization |
| Contract CI | OpenAPI validation, DTO generation |
| Mobile tests | ViewModel state, API error state, edgeReliable rendering |
| System tests | Airflow snapshot job, Supabase schema migration, pgvector retrieval |

---


## 9. Backend Architecture Note

Backend details are split into:

```text
04_BACKEND_ARCHITECTURE.md
```

The backend is an ASP.NET Core modular monolith/BFF, not a thin proxy.

It owns:

```text
Supabase JWT verification
role authorization
prediction orchestration
edge calculation
cache/fallback
admin quality endpoints
simulation jobs
system health
```

---

## 10. UI/UX Direction from Reference Mock

Reference image:

```text
assets/mobile_ui_reference.png
```

The mobile UI should follow:

```text
dark analytics hub
FAN ZONE / ADMIN ZONE role badge
Analytics Hub header
rounded dark cards
blue accent
match cards with team logos
bottom navigation
floating AI/action button
edge and confidence badges
```

---

## 11. Final Implementation Priority

1. Supabase schema + RLS.
2. Local docker stack: backend, ai_engine, Redis, Airflow.
3. ASP.NET Core API skeleton.
4. Python AI mock.
5. Contract-first `/matches/{id}/full`.
6. Redis online feature materialization.
7. Baseline model inference.
8. ScoreMatrix + Total Goals Distribution.
9. Scheduled prediction snapshots.
10. Admin quality dashboard.
