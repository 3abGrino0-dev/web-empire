#!/usr/bin/env bash
set -euo pipefail

# Script: update-supabase-secret.sh
# Purpose: Prompt for a Supabase SECRET key, validate it, add it to Vercel
#          (preview & production), and trigger a fresh preview deployment.
# Safety: Paste the secret only into your local terminal. This script will
#         avoid leaving the secret in the environment when it exits.

echo "Run from the repository root. Paste the secret when prompted."
echo "Do NOT share the secret or paste it into chat or logs."

trap 'unset SUPABASE_SECRET_KEY' EXIT

read -s -p "Paste NEW Supabase SECRET key: " SUPABASE_SECRET_KEY
echo

if [[ "${SUPABASE_SECRET_KEY}" != sb_secret_* ]]; then
  echo "ERROR: Invalid Supabase secret key format"
  unset SUPABASE_SECRET_KEY
  exit 1
else
  echo "Updating Vercel Preview..."

  printf '%s' "${SUPABASE_SECRET_KEY}" \
    | npx vercel@latest env add SUPABASE_SECRET_KEY preview --force

  echo "Updating Vercel Production environment..."

  printf '%s' "${SUPABASE_SECRET_KEY}" \
    | npx vercel@latest env add SUPABASE_SECRET_KEY production --force

  unset SUPABASE_SECRET_KEY

  echo "SECRET CLEARED FROM SHELL"

  echo "Creating fresh Preview deployment..."

  npx vercel@latest deploy \
    --target=preview \
    --logs \
    2>&1 | tee /tmp/web-empire-secure-preview.log

  DEPLOY_EXIT=${PIPESTATUS[0]}

  echo ""
  echo "DEPLOY EXIT CODE: ${DEPLOY_EXIT}"

  if [ "${DEPLOY_EXIT}" -eq 0 ]; then
    echo "SUCCESS"
    echo "SECURE PREVIEW DEPLOYED"
  else
    echo "DEPLOY FAILED"
    tail -n 100 /tmp/web-empire-secure-preview.log
    exit ${DEPLOY_EXIT}
  fi
fi
