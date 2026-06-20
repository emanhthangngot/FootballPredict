# Branch Protection

Configure GitHub branch protection for `dev` and `master` after the first CI run creates check names.

## Required branches

```text
dev
master
```

## Required checks

Enable these required status checks:

```text
repo-policy
dotnet-backend
dotnet-mobile-android
python-ai
contracts-and-compose
```

Also require this check when Supabase files change:

```text
supabase-migration-dry-run
```

Do not require `pattern-frontend` yet. It is an optional prototype gate that runs only when `pattern-frontend/**` changes.

## Recommended branch rules

```text
Require pull request before merging
Require at least 1 approval
Require status checks to pass
Require branches to be up to date before merging
Block force pushes
Block deletions
```

## Current CD policy

CD publishes build artifacts only. There is no staging or production deployment in this stage.
