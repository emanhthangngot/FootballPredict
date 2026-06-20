# 04. BACKEND ARCHITECTURE — ASP.NET Core Modular Monolith

## 1. Backend Role

Backend là **public API duy nhất** cho .NET MAUI Mobile App.

Backend không phải proxy mỏng. Nó là BFF/modular monolith có business logic thật:

```text
Auth / authorization
Rate limiting
Prediction orchestration
Market implied probability calculation
Fresh edge calculation
Cache management
Validation and mismatch handling
Graceful degradation
Admin quality APIs
Simulation async jobs
System health APIs
```

## 2. Backend Folder Structure

```text
backend/
└── FootballPredictor.Api/
    ├── Program.cs
    ├── appsettings.json
    ├── appsettings.Development.json
    ├── Modules/
    │   ├── Auth/
    │   ├── Fixtures/
    │   ├── Predictions/
    │   ├── Insights/
    │   ├── AdminQuality/
    │   ├── Simulation/
    │   └── AdminOps/
    ├── Application/
    │   ├── Contracts/
    │   ├── Common/
    │   ├── Behaviors/
    │   └── Validation/
    ├── Infrastructure/
    │   ├── Persistence/
    │   ├── SupabaseAuth/
    │   ├── PythonAiClient/
    │   ├── FeatureMetadata/
    │   ├── ModelRegistry/
    │   ├── Caching/
    │   ├── AuditLogging/
    │   ├── SimulationJobs/
    │   └── Observability/
    ├── Security/
    └── OpenApi/
```

## 3. Modules

| Module | Responsibility |
|---|---|
| Auth | Supabase JWT verification, role extraction |
| Fixtures | Fixtures list, fixture details, Top Edges |
| Predictions | Prediction orchestration, cache, edge, fallback |
| Insights | AI explanation and guided chat |
| AdminQuality | Quality metrics, calibration, snapshots |
| Simulation | Admin-only async simulation |
| AdminOps | System health, model-version refresh, retrain trigger |

## 4. Important Services

| Service | Responsibility |
|---|---|
| `PredictionOrchestrator` | Coordinates match full response |
| `PythonAiClient` | Calls Python AI internal service |
| `MarketOddsService` | Loads latest odds from Supabase |
| `OddsConverter` | Converts odds to implied probabilities |
| `EdgeCalculator` | Computes model-market edge |
| `ModelPredictionCache` | Redis cache for model output |
| `FeatureMetadataService` | Reads feature materialization metadata |
| `ModelVersionRegistryCache` | Refreshes active model versions from Supabase |
| `PredictionAuditQueue` | Async best-effort audit logging |
| `AdminQualityService` | Aggregates quality metrics |
| `SimulationJobService` | Creates and polls simulation jobs |

## 5. Prediction Orchestration Flow

```text
GET /api/v1/matches/{matchId}/full
  ↓
Load fixture
  ↓
Load latest odds
  ↓
Load active feature materialization metadata
  ↓
Check Redis prediction cache
  ↓
If cache miss: call Python AI Engine
  ↓
Validate core 1X2 output
  ↓
Validate scoreMatrix if present
  ↓
Derive totalGoalsDistribution and BTTS
  ↓
Compute market implied probability
  ↓
Compute fresh edge
  ↓
Attach warnings/fallback flags
  ↓
Enqueue audit event
  ↓
Return response
```

## 6. Backend Validation Rules

Reject full response only when core prediction is not trustworthy:

```text
matchId mismatch
fixtureVersion mismatch
featureMaterializationId mismatch
unknown modelVersion
1X2 probability sum invalid
conformal empty set in MVP
core 1X2 malformed
```

Do not reject full response for score component failures:

```text
scoreMatrix missing
scoreMatrix sum invalid
scoreMatrix tail mass too large
```

Those trigger score model fallback.

## 7. Graceful Degradation

```text
Fresh model prediction cache
  ↓
Stale model prediction cache with warning
  ↓
Market-implied fallback for RESULT_1X2
  ↓
503 if no usable cache or odds
```

Score model fallback:

```text
Return 1X2 prediction
Hide Correct Score Heatmap
Hide Total Goals Distribution
Hide BTTS
scoreDistributionUnavailable = true
```

Insight fallback:

```text
If insight fails inside /matches/{id}/full:
  return prediction
  insightUnavailable = true
```

## 8. Supabase Auth Integration

Backend verifies Supabase JWT.

Roles:

```text
user
admin
system
```

Rules:

```text
User endpoints require authenticated user.
Admin read endpoints require admin.
System mutation endpoints require system role/scope.
Mobile never stores service-role key.
```

## 9. ModelVersionRegistryCache

MLflow Server is removed.

Backend reads:

```text
Supabase table model_version_registry
```

Refresh:

```text
Every 5 minutes
On POST /api/v1/admin/model-version/refresh
Use last known cache if Supabase temporarily unavailable
```

## 10. Backend Tests

Required:

```text
PredictionOrchestrator unit tests
EdgeCalculator tests
OddsConverter tests
CacheKeyBuilder tests
Validation rules tests
Fallback chain tests
Supabase JWT role tests
Admin authorization tests
PythonAiClient contract tests
```
