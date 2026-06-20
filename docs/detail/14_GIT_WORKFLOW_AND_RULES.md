# 14. GIT WORKFLOW AND RULES

## 1. Branch Strategy

```text
main
develop
feature/<area>/<task-name>
hotfix/<short-name>
```

Examples:

```text
feature/backend/prediction-orchestrator
feature/mobile/home-top-edges
feature/ai/score-matrix
feature/etl/redis-materialization
feature/docs/tdd-sdd-baseline
```

## 2. Merge Rules

| Source | Target | Strategy |
|---|---|---|
| feature/* | develop | Squash merge |
| develop | main | Merge commit |
| hotfix/* | main + develop | PR required |

## 3. Commit Convention

```text
feat(backend): add prediction orchestrator
fix(ai): handle missing redis feature key
test(etl): add no-leakage tests
docs(api): update match full response contract
ci(mobile): add android build workflow
```

## 4. PR Checklist

```text
Build passes
Tests pass
OpenAPI updated if API changed
Supabase migration added if schema changed
Docs updated if architecture changed
No service-role key in client
No direct mobile table access
```

## 5. Protected Branches

`main` and `develop` should require:

```text
Pull request
At least 1 reviewer
CI pass
No direct push
```
