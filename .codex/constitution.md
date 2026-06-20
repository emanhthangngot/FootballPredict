<!-- CODEKIT START -->
# FootballPredict Project Constitution

> **Version**: 1.0.0 | **Ratified**: 2026-06-20 | **Last Amended**: 2026-06-20
> This file is the single source of truth for non-negotiable project rules.
> `.codex/` skills, agents, commands, and hooks MUST conform to it.
> To amend: open a PR with title `docs(constitution): <change>` and bump `Last Amended`.

## 1. Mission

FootballPredict is an **analytics and explainable-AI** platform for football match prediction. It
delivers calibrated probabilities, feature attributions, and scenario simulations to a B2B audience
of analysts, tipsters, and media desks.

It is **not** a betting product. The system MUST never present outputs as wagering advice, accept
bets, or integrate with bookmaker settlement APIs.

## 2. Non-negotiable principles

### 2.1 Analytics, never betting

- All UI strings use **probability, confidence, expected value** language.
- No "tip", "bet", "stake", "odds lock", or similar terms in user-facing copy.
- A persistent footer MUST show: *"Analytics & explainable AI. Not betting advice."*
- If a downstream integration requests betting framing, **decline and document** in `SECURITY.md`.

### 2.2 No service-role key in client

- Supabase `service_role` key MAY only live in backend env vars and CI secrets.
- Mobile/web clients MUST use the `anon` key with RLS.
- A `pre_file_edit_policy` hook already blocks obvious leaks; treat any bypass as a P1 incident.

### 2.3 No direct mobile table access

- Mobile clients MUST go through the BFF (Backend-for-Frontend) — never Supabase directly for
  domain tables.
- Exception list: only `public.matches_view` (read-only) is allowed from mobile, and only if
  the view has `security_invoker = true`.

### 2.4 Reproducible predictions

- Every prediction MUST carry: model version, feature snapshot hash, training-data cutoff date.
- A prediction without provenance MUST NOT be returned to a client.

### 2.5 Defense in depth

- A single security control failing MUST NOT cause a data breach.
- Every new data egress (DB, API, cache, log) requires an explicit allowlist entry in
  `.codex/rules/security.md` (or equivalent) and a review sign-off.

## 3. Tech stack guardrails (hard limits)

| Layer | Allowed | Forbidden |
|---|---|---|
| Backend | .NET 8/9, EF Core, Supabase Postgres | Ad-hoc ORMs, raw ADO outside EF |
| Mobile | .NET MAUI on .NET 8/9 | Native UI bypass of BFF |
| AI | Python 3.11, PyTorch, scikit-learn | Calling model endpoints from mobile |
| Data | Supabase + Redis + S3-compatible object store | SQLite in production |
| Frontend (admin) | React 18 + Vite + TypeScript | jQuery, CRA, non-Vite bundlers |

## 4. Data ethics

- No personal data on players, fans, or minors.
- Match data is licensed through the data provider contract; redistribution is out of scope.
- Model fairness MUST be re-evaluated every release; report drift in `docs/ai/fairness.md`.

## 5. Working agreement

- Spec before code (see `commands/sdd/specify.md`).
- TDD for backend business logic (see `skills/test-driven-change`).
- PR must pass the 7-item checklist in `rules/git.md` §4.
- Every agent-made commit ends with the trailer:
  `Assisted-by: <AgentName> (model: <model-id>, <autonomous|semi-autonomous|human-assisted>)`
<!-- CODEKIT END -->
