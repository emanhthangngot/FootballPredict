# 06. API SYSTEM DESIGN — ASP.NET Core Public API + Python Internal API

## 1. API Principles

| Principle | Decision |
|---|---|
| Versioned | `/api/v1` |
| JSON-first | REST/JSON |
| Auth | Supabase JWT verified by ASP.NET Core |
| Client | .NET MAUI calls only ASP.NET Core |
| Internal AI | Backend calls Python AI Engine |
| Contract-first | OpenAPI before implementation |

## 2. User API

```http
GET  /api/v1/fixtures
GET  /api/v1/fixtures/{matchId}
GET  /api/v1/fixtures/top-edges
GET  /api/v1/matches/{matchId}/full
GET  /api/v1/predictions/{matchId}
GET  /api/v1/insights/explain/{matchId}
POST /api/v1/insights/ask
```

## 3. Admin API

```http
GET  /api/v1/admin/status
GET  /api/v1/admin/quality/summary
GET  /api/v1/admin/quality/calibration
GET  /api/v1/admin/quality/model-vs-market
GET  /api/v1/admin/quality/snapshots
GET  /api/v1/admin/quality/freshness
POST /api/v1/admin/simulations
GET  /api/v1/admin/simulations/{simulationId}
POST /api/v1/admin/model-version/refresh
POST /api/v1/admin/retrain
```

`model-version/refresh` and `retrain` require System role/scope.

## 4. Main Endpoint

```http
GET /api/v1/matches/{matchId}/full
```

Response includes:

```text
fixture
prediction
marketComparison
edgeTimeline
scoreHeatmap
totalGoalsDistribution
btts
featureBreakdown
aiExplanation
warnings
metadata
```

## 5. Error Envelope

```json
{
  "error": {
    "code": "predictionUnavailable",
    "message": "Prediction is temporarily unavailable.",
    "correlationId": "abc-123"
  }
}
```

## 6. Validation Rules

Reject 502:

```text
matchId mismatch
fixtureVersion mismatch
featureMaterializationId mismatch
unknown modelVersion
1X2 probability sum invalid
conformal empty set in MVP
core 1X2 malformed
```

Score fallback, not full failure:

```text
scoreMatrix missing
scoreMatrix sum invalid
scoreMatrix tail mass too large
```

## 7. Rate Limits

```text
Default authenticated user: 120 req/min
Prediction endpoints: 60 req/min, burst 20
Insight chat: 10 req/min, burst 3
Admin read: 300 req/min, burst 50
Admin simulation mutation: 30 req/hour
System-only mutation: 5 req/hour
```

## 8. Internal AI API

```http
POST /internal/v1/predict
POST /internal/v1/explain
GET  /internal/v1/health
```

Internal prediction request:

```json
{
  "matchId": 123,
  "fixtureVersion": "fixture-2026-06-18T10:00:00Z",
  "featureMaterializationId": "featmat-2026-06-18-0955",
  "featureSnapshotTimestamp": "2026-06-18T09:55:00Z",
  "modelTask": "fullPrediction"
}
```

Python AI reads features from Redis by:

```text
feature:match:{matchId}:{featureMaterializationId}
```
