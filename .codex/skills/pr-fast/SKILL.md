---
name: pr-fast
description: Create a pull request quickly with GitHub CLI (gh). Use when the user asks to prepare or open a PR, generate PR descriptions, or handle commits for a PR.
---

# PR Fast (gh)

Fast workflow to prepare a clean PR using GitHub CLI.

## Preconditions
- `gh` is installed and authenticated.
- `git` repo is clean or changes are understood.

## Workflow
1) Check repo state
   - `git status -sb`
   - If there are unrelated changes, ask what to include.
2) Create or update a branch
   - If on `main`, create a branch: `git checkout -b <branch>`
   - Use a short, kebab-case name (e.g., `hud-shortcuts`).
3) Stage and commit
   - Prefer small, focused commits.
   - Use a clear, conventional-ish subject (e.g., `fix: reduce ball count`).
4) Push branch
   - `git push -u origin <branch>`
5) Build PR title + description
   - Title: short and specific.
   - Body template:
     - Summary
     - Changes
     - Testing
     - Notes (optional)
6) Create PR with `gh`
   - `gh pr create --title "<title>" --body "<body>" --base main --head <branch>`
7) Show PR URL and next steps.

## PR Body Template
Summary:
- <1–2 bullets>

Changes:
- <bullets of key changes>

Testing:
- <commands run> or "Not run (reason)"

Notes:
- <optional>

## Guardrails
- Never include `node_modules` in commits.
- If `gh` is missing or unauthenticated, ask the user to install/login.
- If there are staged files not requested, ask before committing.
