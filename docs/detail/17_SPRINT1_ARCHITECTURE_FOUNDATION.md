# 17. SPRINT 1 — ARCHITECTURE FOUNDATION

## 1. Sprint Goal

Build the foundation so all team members can work in parallel.

Output:

```text
Supabase schema draft
RLS draft
ASP.NET Core skeleton
Python AI mock
Redis running
Airflow LocalExecutor running
Mobile shell running
OpenAPI v1 draft
```

Current implementation entry point:

```text
docs/ARCHITECTURE_FOUNDATION_PLAN.md
```

## 2. Backend Tasks

| Task | DoD |
|---|---|
| Create ASP.NET Core solution | API starts locally |
| Add module folders | Auth, Fixtures, Predictions, Insights, AdminQuality |
| Add Supabase JWT verification draft | Current user extracted |
| Add `/health` | Returns healthy |
| Add OpenAPI setup | Swagger visible |
| Add PythonAiClient mock | Can call mock AI endpoint |

## 3. AI/Data Tasks

| Task | DoD |
|---|---|
| Create Python AI FastAPI app | `/health` works |
| Create prediction mock | Returns valid 1X2 + scoreMatrix |
| Create Redis feature reader stub | Reads test key |
| Create Airflow DAG sample | Runs in LocalExecutor |
| Create Supabase schema migration draft | SQL reviewed |
| Create pgvector enable script | Extension enabled |

## 4. Mobile Tasks

| Task | DoD |
|---|---|
| Create .NET MAUI project | Android target builds |
| Create navigation shell | User/Admin hidden route |
| Create API client stub | Calls backend health |
| Create Home mock UI | Renders fixture cards |
| Create MatchDetail mock UI | Renders probability and edge badge |

## 5. Sprint 1 Integration Tests

```text
Backend health endpoint works
Python AI health endpoint works
Backend can call Python mock
Redis test key can be read
Supabase connection works
Mobile can call backend health
OpenAPI file validates
```
