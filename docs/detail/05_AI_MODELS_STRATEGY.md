# 05. AI MODELS STRATEGY — Prediction, ScoreMatrix, SHAP, RAG

## 1. MVP Model Stack

| Model | Purpose |
|---|---|
| Logistic Regression | Baseline, calibration sanity check |
| XGBoost or LightGBM | Main tabular predictor |
| Dixon-Coles Poisson | Correct score distribution / scoreMatrix |
| Simple stacking | Optional final ensemble |
| MAPIE APS | 1X2 conformal confidence set |
| SHAP | Feature attribution |
| Embedding model | RAG chunk embeddings for pgvector |

## 2. 1X2 Prediction

1X2 is the core source of truth.

```text
homeWinProbability
drawProbability
awayWinProbability
```

Validation:

```text
abs(home + draw + away - 1.0) <= 0.01
```

## 3. ScoreMatrix

Python AI returns scoreMatrix:

```json
{
  "scoreMatrix": {
    "maxGoalsPerTeam": 10,
    "tailHandling": "edgeBucket",
    "cells": [
      {
        "homeGoals": 0,
        "awayGoals": 0,
        "probability": 0.081
      }
    ]
  }
}
```

Tail handling:

```text
(10, j) = homeGoals >= 10 and awayGoals = j
(i, 10) = homeGoals = i and awayGoals >= 10
(10, 10) = homeGoals >= 10 and awayGoals >= 10
```

## 4. Derived Outputs

From scoreMatrix, backend derives:

```text
Correct Score Heatmap
Total Goals Distribution
BTTS
score-model implied 1X2
```

Total Goals:

```text
6+ = P(totalGoals >= 6)
2.5 = default UI threshold only
```

BTTS:

```text
P(BTTS) = sum(scoreMatrix[i][j]) where i >= 1 and j >= 1
```

## 5. SHAP Feature Breakdown

MVP returns top 8 features.

```json
{
  "featureBreakdown": {
    "method": "shap",
    "modelVersion": "ensemble-v3",
    "target": "homeWin",
    "topFeatures": [
      {
        "featureName": "homeEloDiff",
        "displayName": "Home Elo advantage",
        "value": 72.4,
        "impact": 0.083,
        "direction": "increase",
        "rank": 1,
        "group": "team_strength"
      }
    ],
    "maxFeatures": 8
  }
}
```

## 6. RAG with pgvector

Qdrant is removed. RAG uses Supabase Postgres + pgvector.

Pipeline:

```text
Airflow builds documents
Airflow chunks documents
Airflow embeds chunks
Airflow inserts embeddings into rag_embeddings
Python AI Engine retrieves top-k chunks via pgvector
LLM/generator creates bounded explanation
```

## 7. Conformal Prediction

MVP:

```text
MAPIE APS-style conformal classification for 1X2 only.
```

Phase 2:

```text
Binary conformal interval for BTTS.
Binary conformal interval for total-goals thresholds.
Uncertainty band for total goals distribution.
```

## 8. Model Registry Without MLflow

No MLflow server.

Model metadata stored in Supabase table:

```text
model_version_registry
```

Artifacts can be stored in:

```text
local volume for local dev
Supabase Storage or object storage later
```
