# 12. PROJECT MANAGEMENT

## 1. Project Format

| Attribute | Value |
|---|---|
| Project type | Academic / portfolio AI engineering project |
| Duration | 18 weeks |
| Team size | 3 people |
| Method | Agile sprint, 2-week increments |
| Repo | GitHub monorepo |
| Delivery | Mobile app + backend + AI/data pipeline |

## 2. Team Roles

| Role | Owner |
|---|---|
| Backend / Integration Owner | Person 1 |
| Mobile / UI Owner | Person 2 |
| AI / Data Owner | Person 3 |

## 3. Board Columns

```text
Backlog
Contract Needed
Ready
In Progress
Review
Integration Test
Done
```

## 4. Risk Register

| Risk | Mitigation |
|---|---|
| Supabase schema changes late | Contract-first + migrations |
| Redis feature misses | fallback + feature_materialization_registry |
| AI model too slow | baseline model + cache |
| Airflow too heavy locally | LocalExecutor + memory limits |
| RAG not useful enough | guided quick replies + SHAP first |
| Edge wrong due to stale odds | edgeReliable + freshness rules |
| Team bottleneck | integration owner + weekly contract review |
