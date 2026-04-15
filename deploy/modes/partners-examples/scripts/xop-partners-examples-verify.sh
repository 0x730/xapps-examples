#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${DEPLOY_DIR}"
source "${SCRIPT_DIR}/_xop_partners_examples.sh"

ENV_FILE="${ENV_FILE:-$(xop_partners_examples_env_file "${DEPLOY_DIR}")}"
ENV_TEMPLATE_FILE="${ENV_TEMPLATE_FILE:-$(xop_partners_examples_env_example_file "${DEPLOY_DIR}")}"
COMPOSE_FILE="${COMPOSE_FILE:-$(xop_partners_examples_compose_file "${DEPLOY_DIR}")}"
PROJECT_NAME="${PROJECT_NAME:-$(xop_partners_examples_project_name)}"

VERIFY_RETRIES="${VERIFY_RETRIES:-30}"
VERIFY_SLEEP_SECONDS="${VERIFY_SLEEP_SECONDS:-2}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[xop-partners-examples-verify] ${ENV_FILE} not found. Create it from ${ENV_TEMPLATE_FILE}"
  exit 1
fi

set -a
source <(sed -e 's/\r$//' "${ENV_FILE}")
set +a

wait_for_http_ok() {
  local url="$1"
  local label="$2"
  local i
  for ((i = 1; i <= VERIFY_RETRIES; i++)); do
    if curl -fsS "${url}" >/dev/null; then
      return 0
    fi
    if [[ "${i}" -lt "${VERIFY_RETRIES}" ]]; then
      echo "[xop-partners-examples-verify] waiting for ${label} (${i}/${VERIFY_RETRIES})..."
      sleep "${VERIFY_SLEEP_SECONDS}"
    fi
  done
  echo "[xop-partners-examples-verify] ${label} failed after ${VERIFY_RETRIES} retries: ${url}"
  return 1
}

wait_for_json_post_ok() {
  local url="$1"
  local label="$2"
  local body_json="$3"
  local i
  local body
  local http_code
  local response_file
  response_file="$(mktemp)"
  for ((i = 1; i <= VERIFY_RETRIES; i++)); do
    http_code="$(curl -sS -o "${response_file}" -w '%{http_code}' -X POST "${url}" -H 'Content-Type: application/json' -d "${body_json}" 2>/dev/null || true)"
    body="$(cat "${response_file}" 2>/dev/null || true)"
    if [[ "${http_code}" =~ ^2[0-9][0-9]$ ]] && [[ -n "${body}" ]] && printf '%s' "${body}" | node -e '
const fs = require("node:fs");
const raw = fs.readFileSync(0, "utf8");
const data = JSON.parse(raw);
if (!String(data.subjectId || "").trim()) process.exit(1);
if (!String(data.bootstrapToken || "").trim()) process.exit(1);
' >/dev/null 2>&1; then
      rm -f "${response_file}"
      return 0
    fi
    if [[ "${i}" -lt "${VERIFY_RETRIES}" ]]; then
      echo "[xop-partners-examples-verify] waiting for ${label} (${i}/${VERIFY_RETRIES})..."
      sleep "${VERIFY_SLEEP_SECONDS}"
    fi
  done
  echo "[xop-partners-examples-verify] ${label} failed after ${VERIFY_RETRIES} retries: ${url} (last status: ${http_code:-n/a})"
  if [[ -n "${body:-}" ]]; then
    echo "[xop-partners-examples-verify] last body: ${body}"
  fi
  rm -f "${response_file}"
  return 1
}

wait_for_health_ok() {
  local url="$1"
  local label="$2"
  local i
  local body
  for ((i = 1; i <= VERIFY_RETRIES; i++)); do
    body="$(curl -fsS "${url}" 2>/dev/null || true)"
    if [[ -n "${body}" ]] && printf '%s' "${body}" | node -e '
const fs = require("node:fs");
const raw = fs.readFileSync(0, "utf8");
const data = JSON.parse(raw);
if (data.ok === true) process.exit(0);
if (String(data.status || "").trim().toLowerCase() === "ok") process.exit(0);
process.exit(1);
' >/dev/null 2>&1; then
      return 0
    fi
    if [[ "${i}" -lt "${VERIFY_RETRIES}" ]]; then
      echo "[xop-partners-examples-verify] waiting for ${label} (${i}/${VERIFY_RETRIES})..."
      sleep "${VERIFY_SLEEP_SECONDS}"
    fi
  done
  echo "[xop-partners-examples-verify] ${label} failed after ${VERIFY_RETRIES} retries: ${url}"
  if [[ -n "${body:-}" ]]; then
    echo "[xop-partners-examples-verify] last health body: ${body}"
  fi
  return 1
}

print_service_debug() {
  local service="$1"
  local profile_args=(
    --profile example-publisher
    --profile host-proof
    --profile tenant-b
    --profile tenant-b-host-proof
    --profile tenant-c
    --profile tenant-c-host-proof
  )
  echo "[xop-partners-examples-verify] --- ${service} status ---"
  if ! docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "${profile_args[@]}" ps "${service}"; then
    docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "${profile_args[@]}" ps || true
  fi
  echo "[xop-partners-examples-verify] --- ${service} logs (last 120) ---"
  if ! docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "${profile_args[@]}" logs --tail 120 "${service}"; then
    docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "${profile_args[@]}" logs --tail 120 || true
  fi
}

XCONECTA_URL="${VERIFY_XCONECTA_URL:-http://localhost:${XCONECTA_PORT:-3314}}"
XCONECTB_URL="${VERIFY_XCONECTB_URL:-http://localhost:${XCONECTB_PORT:-3313}}"
XPLACE_EXAMPLE_URL="${VERIFY_XPLACE_EXAMPLE_URL:-http://localhost:${XPLACE_EXAMPLE_PORT:-3016}}"
XCONECTC_URL="${VERIFY_XCONECTC_URL:-http://localhost:${XCONECTC_PORT:-8001}}"
XCONECTC_HOST_URL="${VERIFY_XCONECTC_HOST_URL:-http://localhost:${XCONECTC_HOST_PORT:-8002}}"
XCONECTA_HOST_URL="${VERIFY_XCONECTA_HOST_URL:-http://localhost:${XCONECTA_HOST_PORT:-3414}}"
XCONECTB_HOST_URL="${VERIFY_XCONECTB_HOST_URL:-http://localhost:${XCONECTB_HOST_PORT:-3413}}"
XCONECTC_HEALTH_URL="${VERIFY_XCONECTC_HEALTH_URL:-${XCONECTC_URL}/api/health}"
XCONECTC_HOST_HEALTH_URL="${VERIFY_XCONECTC_HOST_HEALTH_URL:-${XCONECTC_HOST_URL}/api/health}"

if ! wait_for_health_ok "${XCONECTA_URL}/health" "xconecta health"; then
  print_service_debug "xconecta"
  exit 1
fi
if [[ "${ENABLE_XCONECTA_HOST:-0}" == "1" ]]; then
  if ! wait_for_health_ok "${XCONECTA_HOST_URL}/health" "xconecta-host health"; then
    print_service_debug "xconecta-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTA_HOST_URL}/marketplace.html" "xconecta-host marketplace"; then
    print_service_debug "xconecta-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTA_HOST_URL}/single-xapp.html" "xconecta-host single-xapp"; then
    print_service_debug "xconecta-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTA_HOST_URL}/host/proof-config.js" "xconecta-host proof config"; then
    print_service_debug "xconecta-host"
    exit 1
  fi
  if ! wait_for_json_post_ok "${XCONECTA_HOST_URL}/api/host-bootstrap" "xconecta-host bootstrap" '{"email":"partners.verify+xconecta@example.com","name":"Partners Verify"}'; then
    print_service_debug "xconecta-host"
    exit 1
  fi
fi
if ! wait_for_health_ok "${XCONECTB_URL}/health" "xconectb health"; then
  print_service_debug "xconectb"
  exit 1
fi
if [[ "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
  if ! wait_for_health_ok "${XCONECTB_HOST_URL}/health" "xconectb-host health"; then
    print_service_debug "xconectb-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTB_HOST_URL}/marketplace.html" "xconectb-host marketplace"; then
    print_service_debug "xconectb-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTB_HOST_URL}/single-xapp.html" "xconectb-host single-xapp"; then
    print_service_debug "xconectb-host"
    exit 1
  fi
  if ! wait_for_http_ok "${XCONECTB_HOST_URL}/host/proof-config.js" "xconectb-host proof config"; then
    print_service_debug "xconectb-host"
    exit 1
  fi
  if ! wait_for_json_post_ok "${XCONECTB_HOST_URL}/api/host-bootstrap" "xconectb-host bootstrap" '{"email":"partners.verify+xconectb@example.com","name":"Partners Verify"}'; then
    print_service_debug "xconectb-host"
    exit 1
  fi
fi
if [[ "${ENABLE_XCONECTC:-0}" == "1" ]]; then
  if ! wait_for_health_ok "${XCONECTC_HEALTH_URL}" "xconectc health"; then
    print_service_debug "xconectc"
    exit 1
  fi
  if [[ "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
    if ! wait_for_health_ok "${XCONECTC_HOST_HEALTH_URL}" "xconectc-host health"; then
      print_service_debug "xconectc-host"
      exit 1
    fi
    if ! wait_for_http_ok "${XCONECTC_HOST_URL}/marketplace.html" "xconectc-host marketplace"; then
      print_service_debug "xconectc-host"
      exit 1
    fi
    if ! wait_for_http_ok "${XCONECTC_HOST_URL}/single-xapp.html" "xconectc-host single-xapp"; then
      print_service_debug "xconectc-host"
      exit 1
    fi
    if ! wait_for_http_ok "${XCONECTC_HOST_URL}/host/proof-config.js" "xconectc-host proof config"; then
      print_service_debug "xconectc-host"
      exit 1
    fi
    if ! wait_for_json_post_ok "${XCONECTC_HOST_URL}/api/host-bootstrap" "xconectc-host bootstrap" '{"email":"partners.verify+xconectc@example.com","name":"Partners Verify"}'; then
      print_service_debug "xconectc-host"
      exit 1
    fi
  fi
fi
if ! wait_for_health_ok "${XPLACE_EXAMPLE_URL}/health" "xplace-example health"; then
  print_service_debug "xplace-example"
  exit 1
fi

echo "[xop-partners-examples-verify] OK"
