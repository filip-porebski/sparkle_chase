#!/usr/bin/env bash
# Local release helper for SparkleChase
#
# Usage:
#   1) Copy this file to scripts/release_with_token.sh (this filename is gitignored)
#      cp scripts/release_with_token.example.sh scripts/release_with_token.sh
#   2) Edit scripts/release_with_token.sh and set GH_TOKEN below to your GitHub token
#   3) Run:
#      bash scripts/release_with_token.sh [patch|minor|major|none]
#         - Default bump is patch; pass 'none' to skip version bump/tag push

set -Eeuo pipefail

# --- Configuration ---
# Put your GitHub Personal Access Token here (has to have repo permissions)
GH_TOKEN_VALUE="REPLACE_WITH_YOUR_GITHUB_TOKEN"

# ---------------------
cd "$(dirname "$0")/.."

# Ensure token is present (env var overrides inline value)
GH_TOKEN="${GH_TOKEN:-${GH_TOKEN_VALUE}}"
if [[ -z "${GH_TOKEN}" || "${GH_TOKEN}" == "REPLACE_WITH_YOUR_GITHUB_TOKEN" ]]; then
  echo "[release] GH_TOKEN not set. Edit scripts/release_with_token.sh and set GH_TOKEN_VALUE, or export GH_TOKEN in your shell."
  exit 1
fi
export GH_TOKEN

# Optional version bump (default: patch)
BUMP="${1:-patch}"
if [[ "${BUMP}" != "none" ]]; then
  # Ensure clean git state – auto-commit any staged/unstaged changes
  if [[ -n "$(git status --porcelain)" ]]; then
    echo "[release] Working tree not clean – committing pending changes"
    git add -A
    git commit -m "chore: pre-release snapshot"
  fi
  if [[ "${BUMP}" != "patch" && "${BUMP}" != "minor" && "${BUMP}" != "major" ]]; then
    echo "[release] Unknown bump type: ${BUMP}. Use patch|minor|major|none"; exit 1
  fi
  echo "[release] Bumping version: ${BUMP}"
  npm run "version:${BUMP}"
  echo "[release] Pushing commits and tags"
  git push
  git push --tags
fi

echo "[release] Installing deps"
npm ci

echo "[release] Building and publishing to GitHub Releases"
npm run release

echo "[release] Done. Check your GitHub Releases page."
