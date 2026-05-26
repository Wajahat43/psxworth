# Contributing to PSXworth

Thanks for your interest in contributing! This guide will get you started.

## Before You Start

**Always get assigned to an issue before writing any code.**
Comment on the issue you want to work on and wait for a maintainer to assign it to you.
This avoids multiple people working on the same thing.

Don't see your bug or feature listed? **Open a new issue** describing it. For bugs, include steps to reproduce, expected vs. actual behavior, and a screenshot if relevant. For features, describe the use case and rough proposal. Then comment to ask to be assigned before you start coding.

## Branching model

- **`develop`** — active development. All PRs target this branch.
- **`main`** — production. Updated only from `develop` via release PRs by the maintainer.

**Open PRs against `develop`, not `main`.** PRs targeting `main` will be closed or asked to be retargeted.

## Workflow

1. **Find an issue** — look for open issues, pick one that's unassigned
2. **Comment on it** — say you'd like to work on it and wait to be assigned
3. **Fork the repo** and clone your fork locally
4. **Set up upstream** (one-time step after cloning)
   ```bash
   git remote add upstream https://github.com/Wajahat43/psxworth.git
   git fetch upstream
   ```
5. **Create a branch** from `develop` (not `main`)
   ```bash
   git checkout -b fix/your-branch-name upstream/develop
   ```
6. **Make your changes** and commit with a clear message
7. **Push to your fork** and open a PR targeting the `develop` branch
8. **Link the issue** in your PR description so it auto-closes when the PR is merged

   **Correct format:**
   ```
   Closes #6
   ```
   **Common mistakes that will NOT auto-close the issue:**
   ```
   Closes # 6     ← space before the number
   Closes # [6]   ← brackets around the number
   Close #6       ← missing the 's'
   ```

## Branch Naming

| Type | Example |
|------|---------|
| Bug fix | `fix/drawer-height-ios` |
| Feature | `feat/auto-fill-shares` |
| Refactor | `refactor/unified-button` |

## Architecture

For where to put new code (and where not to), see [docs/architecture.md](docs/architecture.md).

## PR Guidelines

- Keep PR focused on 1 issue
- Don't refactor unrelated code in the same PR
- For UI changes, include a screen recording showing **before and after** the change (a screenshot is okay for trivial visual tweaks, but a video is strongly preferred — it makes the change much easier to review)
- Run these before opening a PR:
  ```bash
  pnpm lint
  pnpm lint:types
  ```
  > `pnpm lint` catches code style issues. `pnpm lint:types` runs the TypeScript compiler and catches type errors. Note: `pnpm dev` does **not** type-check — a bug that works in dev can still fail the build.
- Don't open a PR without being assigned to the issue first

## Questions?

Open a discussion or comment on the relevant issue — no question is too small.
