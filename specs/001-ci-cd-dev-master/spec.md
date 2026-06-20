# Spec: 001-ci-cd-dev-master

> **Spec ID**: 001
> **Author**: Codex
> **Created**: 2026-06-21
> **Status**: draft
> **Constitution**: `.codex/constitution.md` v1.0.0

## 1. Intent

Set up CI/CD gates for the real repository branches `dev` and `master` before continuing Stage 1 feature work.

## 2. Context

- The repository has backend, AI engine, mobile shell, contracts, Supabase schema draft, and local compose foundation.
- There were no GitHub Actions workflows before this spec.
- The active branch pair is `dev/master`.
- CD has no deployment target yet, so this stage publishes build artifacts only.

## 3. Non-goals

- No staging or production deploy.
- No container registry push.
- No GitHub repository settings automation.
- No real Supabase project migration apply.
- No secret values committed or required for this stage.

## 4. Users & flows

- Primary user: maintainer merging into `dev` or `master`.
- Secondary users: backend, mobile, AI/data owners who need fast feedback.
- Happy path: push or PR targets `dev`/`master`, CI runs, green CI triggers artifact publishing.
- Failure path: any build/test/contract/migration check fails, merge is blocked after branch protection is configured.

## 5. Functional requirements

| ID | Requirement | Priority | Acceptance |
|---|---|---:|---|
| FR-1 | CI runs on PR and push to `dev` and `master` | P0 | `.github/workflows/ci.yml` exists with both branches |
| FR-2 | Backend build is gated | P0 | CI restores and builds `backend/FootballPredictor.Api` |
| FR-3 | Mobile Android build is gated | P0 | CI installs MAUI Android workload and builds `net8.0-android` |
| FR-4 | AI tests are gated | P0 | CI syncs `ai_engine` with `uv` and runs pytest |
| FR-5 | Contract/runtime files are gated | P0 | JSON schemas, OpenAPI YAML, and compose config validate |
| FR-6 | Supabase migration dry-run exists | P0 | Workflow applies migration to a pgvector Postgres service |
| FR-7 | Mobile boundary policy runs | P0 | CI fails if MAUI code imports direct Supabase clients |
| FR-8 | Artifact publishing exists | P1 | Successful CI can publish backend, mobile, contracts, Supabase, runtime artifacts |
| FR-9 | Pattern frontend is optional | P1 | Pattern frontend workflow runs only for `pattern-frontend/**` changes |

## 6. Non-functional requirements

- **Reliability**: required CI jobs fail closed, with no `continue-on-error`.
- **Security**: no client path may bypass the backend BFF.
- **Maintainability**: branch protection requirements are documented.
- **Speed**: prototype frontend checks do not run for unrelated backend/mobile changes.

## 7. Data contract

- No production data changes.
- Migration dry-run uses a short-lived CI database container.
- The migration workflow validates SQL compatibility only.

## 8. API contract

- No public API change.
- Existing OpenAPI and internal AI schemas are validated by CI.

## 9. Risks & open questions

| Risk | Likelihood | Impact | Mitigation |
|---|---:|---:|---|
| MAUI workload install is slow or flaky | M | M | Keep it isolated in its own required job |
| Supabase SQL requires hosted-only functions | M | M | Add a CI compatibility shim for migration dry-run |
| Artifact CD is mistaken for deployment | L | M | Document that this stage publishes artifacts only |

## 10. Definition of done

- [ ] CI workflows exist for `dev` and `master`.
- [ ] CD artifacts workflow exists and does not deploy.
- [ ] Pattern frontend optional workflow exists.
- [ ] Branch protection docs list required checks.
- [ ] Local YAML/JSON validations pass.
- [ ] Docs updated from `develop/main` to `dev/master`.

## 11. References

- Plan: `specs/001-ci-cd-dev-master/plan.md`
- Tasks: `specs/001-ci-cd-dev-master/tasks.md`
- ADR: `docs/adr/0001-ci-cd-branch-gates.md`
