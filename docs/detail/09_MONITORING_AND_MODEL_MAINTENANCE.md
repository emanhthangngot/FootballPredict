# 09. MONITORING AND MODEL MAINTENANCE

> This replaces the previous `Continual Learning` wording. MVP does **not** implement online continual learning.

## 1. Monitoring Goals

Track:

```text
Model quality
Calibration
Data freshness
Scheduled snapshot coverage
Prediction latency
AI Engine health
Redis feature freshness
Supabase query health
RAG embedding freshness
```

## 2. What MVP Does Not Do

MVP does not implement:

```text
online learning
auto retraining from user traffic
auto promote model
advanced drift detection
uncontrolled feedback loop
```

Retraining is controlled by Airflow and promotion is explicit/manual or system-approved.

## 3. Scheduled Snapshots

Airflow creates snapshots at:

```text
T_MINUS_24H
T_MINUS_3H
T_MINUS_30M
```

Snapshots are independent from user traffic. This prevents calibration bias.

## 4. Quality Metrics

| Metric | Purpose |
|---|---|
| Log loss | Probability quality |
| Brier score | Calibration and accuracy |
| ECE | Expected calibration error |
| Model vs market log loss | Compare model benchmark |
| Snapshot coverage | Detect missing snapshot jobs |
| Stale feature rate | Detect data freshness issues |
| Stale odds rate | Detect market freshness issues |

## 5. Model Registry Refresh

No MLflow.

Backend refreshes `ModelVersionRegistryCache` from Supabase every 5 minutes.

System endpoint:

```http
POST /api/v1/admin/model-version/refresh
```

## 6. Alerts

| Condition | Severity |
|---|---|
| Missing T-30m snapshot > 5% | Warning |
| Unknown model version returned by AI | Critical |
| Redis feature miss rate high | Warning |
| Supabase unavailable | Critical |
| AI Engine circuit open | Warning |
| score_distribution_unavailable_total spike | Warning |
| stale_market_odds_total spike | Warning |

## 7. Maintenance Workflow

```text
Airflow retraining DAG runs
  ↓
Evaluate model on historical validation set
  ↓
Write metrics into model_version_registry
  ↓
Compare against active model
  ↓
If acceptable, promote manually/system-approved
  ↓
Backend ModelVersionRegistryCache refreshes
```

## 8. Admin Visibility

Admin screens should expose:

```text
current active model version
last promoted time
model registry cache freshness
latest scheduled snapshot status
latest feature materialization status
latest RAG embedding build status
```
