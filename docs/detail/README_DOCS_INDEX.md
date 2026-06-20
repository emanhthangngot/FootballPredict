# Football Predictor Docs Index

Bộ tài liệu này được chia theo style đánh số giống repo mẫu, nhưng đã được điều chỉnh cho dự án **Football Match Predictor Mobile App**.

## Kiến trúc chốt

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

## Quyết định chính

| Nhóm | Quyết định |
|---|---|
| Client | .NET MAUI Mobile App |
| Frontend folder | `frontend/FootballPredictor.Mobile` nhưng đây là mobile app, không phải web |
| Backend | ASP.NET Core Modular Monolith |
| AI Engine | Python FastAPI internal service |
| Database | Supabase Postgres |
| Auth | Supabase Auth + JWT verification in ASP.NET Core |
| Online feature store | Redis |
| RAG Vector Search | Supabase Postgres + pgvector |
| Workflow orchestration | Apache Airflow |
| Removed | Feast, Qdrant, MLflow Server |
| CI/CD | GitHub Actions |
| Design docs | TDD + SDD included in master file |

## File list

| File | Purpose |
|---|---|
| `../ARCHITECTURE_FOUNDATION_PLAN.md` | Khung điều phối để hoàn thiện architecture ban đầu trước implementation |
| `00_MASTER_PRODUCT_TDD_SDD.md` | File chung: product plan + TDD + SDD + implementation rules |
| `01_PROJECT_OVERVIEW.md` | Tổng quan sản phẩm, scope, persona |
| `02_SYSTEM_ARCHITECTURE.md` | Runtime architecture, boundaries, deployment |
| `03_DATA_PIPELINE_AND_SCHEMA.md` | Airflow, Supabase schema, Redis, pgvector |
| `04_BACKEND_ARCHITECTURE.md` | ASP.NET Core backend architecture chi tiết |
| `05_AI_MODELS_STRATEGY.md` | Model strategy, scoreMatrix, SHAP, RAG |
| `06_API_SYSTEM_DESIGN.md` | Public API, internal AI API, error contract |
| `07_CLIENT_UI_UX_ARCHITECTURE.md` | .NET MAUI UI/UX theo mock Analytics Hub |
| `08_AI_EXPLANATION_AND_RAG_DESIGN.md` | RAG with pgvector, guided AI chat, guardrails |
| `09_MONITORING_AND_MODEL_MAINTENANCE.md` | Monitoring, model maintenance, scheduled evaluation |
| `10_SPRINT_PLANNING.md` | 18-week sprint roadmap |
| `11_ETHICS_AND_RESPONSIBLE_AI.md` | Responsible AI, safe product framing |
| `12_PROJECT_MANAGEMENT.md` | Team process, risk register, delivery governance |
| `13_DEVELOPMENT_INFRASTRUCTURE.md` | Repo, docker, Supabase, local 16GB RAM infra |
| `14_GIT_WORKFLOW_AND_RULES.md` | GitHub Flow, PR rules, commit conventions |
| `15_SUPABASE_SCHEMA_DESIGN.md` | Supabase Postgres tables, RLS, indexes |
| `16_THREE_PERSON_DELIVERY_PLAN.md` | Three-person delivery plan |
| `17_SPRINT1_ARCHITECTURE_FOUNDATION.md` | Sprint 1 foundation implementation plan |
| `18_UNIFIED_PRODUCT_UPGRADE_PLAN.md` | Unified upgrade/phase roadmap |

## UI reference

Mock mobile reference được lưu tại:

```text
assets/mobile_ui_reference.png
```

UI/UX docs phát triển dựa trên mock này theo style:

```text
dark analytics terminal
mobile-first
rounded cards
blue accent
bottom navigation
Top Match highlight
Upcoming Fixtures cards
AI assistant entry
Admin hidden surface
```

## Removed / Renamed

| Old file | New decision |
|---|---|
| `08_CONTINUAL_LEARNING_AND_MONITORING.md` | Renamed to `09_MONITORING_AND_MODEL_MAINTENANCE.md` |
| `06_MOBILE_UI_UX_ARCHITECTURE.md` | Replaced by `07_CLIENT_UI_UX_ARCHITECTURE.md` with mock-based UI |
| Missing backend doc | Added `04_BACKEND_ARCHITECTURE.md` |
