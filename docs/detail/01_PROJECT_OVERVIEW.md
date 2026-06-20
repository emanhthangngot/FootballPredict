# 01. PROJECT OVERVIEW — Football Match Predictor

## 1. Bối cảnh

Dự án xây dựng một **mobile football analytics app** có khả năng phân tích dự đoán trận đấu bằng mô hình ML, dữ liệu lịch sử, odds snapshot và giải thích AI.

Điểm khác biệt không phải là “dự đoán thắng thua” đơn thuần, mà là:

```text
Model nghĩ gì?
Model khác market benchmark ở đâu?
Sự khác biệt đó có reliable không?
Model đã từng đúng/sai như thế nào?
```

## 2. Product Scope

### In scope MVP

| Nhóm | Tính năng |
|---|---|
| Mobile user | Fixtures, Top Edges, Match Detail, Edge Timeline |
| Prediction | 1X2 probability, confidence set, scoreMatrix |
| Score analysis | Correct Score Heatmap, Total Goals Distribution, BTTS |
| Market comparison | Required for RESULT_1X2 |
| AI explanation | SHAP + guided AI chat |
| Admin | Quality, calibration, freshness, system health |
| Data pipeline | Airflow ETL, feature materialization, scheduled snapshots |
| Storage | Supabase Postgres, pgvector, Redis |

### Optional MVP

- Total Goals odds ingestion.
- BTTS odds ingestion.
- Market comparison for Total Goals / BTTS.

### Out of scope MVP

- Real-money betting.
- Full bookmaker automation.
- GNN production serving.
- Dedicated Feast/Qdrant/MLflow services.
- Complex champion/challenger UI.

## 3. Main Personas

### User

Wants to quickly see:

- Upcoming fixtures.
- Matches where model disagrees with market.
- Why the model prefers an outcome.
- How edge changes near kickoff.

### Admin

Wants to verify:

- Model quality.
- Calibration.
- Snapshot coverage.
- Data freshness.
- System health.
- Simulation results.

## 4. Core Narrative

```text
User:
  Tôi muốn biết trận nào đáng chú ý, model nghĩ gì, và vì sao.

Admin:
  Tôi muốn biết model có đáng tin không, dữ liệu có fresh không,
  và pipeline có vận hành ổn không.
```

## 5. Key Product Features

| Feature | Surface | Purpose |
|---|---|---|
| Top Edges | User | Discover highest model-market disagreement |
| Edge Timeline | User | See market/model movement at T-24h/T-3h/T-30m |
| Match Detail | User | Main analytics screen |
| Guided AI Chat | User | Explain prediction using controlled context |
| Quality Dashboard | Admin | Track model performance |
| Calibration Dashboard | Admin | Verify probability calibration |
| Snapshot Quality | Admin | Check scheduled snapshot coverage |
| Simulation Lab | Admin | Run what-if strategy evaluation |
| System Health | Admin | Runtime status for backend, AI, Redis, Supabase, Airflow |
