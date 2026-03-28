#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${DEPLOY_DIR}"
source "${SCRIPT_DIR}/_xop_partners_examples.sh"

ENV_FILE="${ENV_FILE:-$(xop_partners_examples_env_file "${DEPLOY_DIR}")}"
ENV_TEMPLATE_FILE="${ENV_TEMPLATE_FILE:-$(xop_partners_examples_env_example_file "${DEPLOY_DIR}")}"
PROJECT_NAME="${PROJECT_NAME:-$(xop_partners_examples_project_name)}"
COMPOSE_FILE="${COMPOSE_FILE:-$(xop_partners_examples_compose_file "${DEPLOY_DIR}")}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[xop-partners-examples-preflight] ${ENV_FILE} not found. Create it from ${ENV_TEMPLATE_FILE}"
  exit 1
fi

set -a
source <(sed -e 's/\r$//' "${ENV_FILE}")
set +a

errors=0

require_non_empty() {
  local key="$1"
  local value="${!key:-}"
  if [[ -z "${value}" ]]; then
    echo "[xop-partners-examples-preflight] Missing required env: ${key}"
    errors=$((errors + 1))
  fi
}

require_http_url() {
  local key="$1"
  local value="${!key:-}"
  if [[ -z "${value}" ]]; then
    echo "[xop-partners-examples-preflight] Missing required env: ${key}"
    errors=$((errors + 1))
    return
  fi
  if [[ ! "${value}" =~ ^https?:// ]]; then
    echo "[xop-partners-examples-preflight] Invalid URL in ${key}: ${value}"
    errors=$((errors + 1))
  fi
}

require_pair_if_any() {
  local key_a="$1"
  local key_b="$2"
  local label="$3"
  local value_a="${!key_a:-}"
  local value_b="${!key_b:-}"
  if [[ -z "${value_a}" && -z "${value_b}" ]]; then
    return
  fi
  if [[ -z "${value_a}" || -z "${value_b}" ]]; then
    echo "[xop-partners-examples-preflight] Incomplete ${label} config: set both ${key_a} and ${key_b}"
    errors=$((errors + 1))
  fi
}

csv_contains_value() {
  local csv="$1"
  local expected="$2"
  IFS=',' read -r -a __csv_values <<< "${csv}"
  local entry
  for entry in "${__csv_values[@]}"; do
    if [[ "$(printf '%s' "${entry}" | xargs)" == "${expected}" ]]; then
      return 0
    fi
  done
  return 1
}

require_csv_contains() {
  local key="$1"
  local expected="$2"
  local label="$3"
  local value="${!key:-}"
  if [[ -z "${value}" ]]; then
    echo "[xop-partners-examples-preflight] Missing required env: ${key}"
    errors=$((errors + 1))
    return
  fi
  if ! csv_contains_value "${value}" "${expected}"; then
    echo "[xop-partners-examples-preflight] ${label} must include ${expected} in ${key}"
    errors=$((errors + 1))
  fi
}

require_http_url "INTERNAL_GATEWAY_BASE_URL"
require_http_url "XCONECTA_PUBLIC_BASE_URL"
require_non_empty "XCONECTA_TENANT_API_KEY"
require_non_empty "XCONECTA_GUARD_INGEST_API_KEY"
if [[ -z "${XCONECTA_TENANT_PAYMENT_RETURN_SECRET:-}" && -z "${XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF:-}" ]]; then
  echo "[xop-partners-examples-preflight] Missing required xconecta signing config: set XCONECTA_TENANT_PAYMENT_RETURN_SECRET or XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF"
  errors=$((errors + 1))
fi
require_csv_contains "XCONECTA_ALLOWED_ORIGINS" "${XCONECTA_PUBLIC_BASE_URL:-}" "xconecta allowed origins"
require_csv_contains "XCONECTA_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTA_PUBLIC_BASE_URL:-}" "xconecta payment return allowlist"
require_pair_if_any "XCONECTA_HOST_BOOTSTRAP_API_KEYS" "XCONECTA_HOST_BOOTSTRAP_SIGNING_SECRET" "xconecta host bootstrap"
if [[ "${ENABLE_XCONECT_HOST:-0}" == "1" ]]; then
  require_http_url "XCONECTA_HOST_PUBLIC_BASE_URL"
  require_http_url "XCONECTA_HOST_BACKEND_BASE_URL"
  require_http_url "XCONECTA_HOST_BOOTSTRAP_BACKEND_BASE_URL"
  require_non_empty "XCONECTA_HOST_BOOTSTRAP_API_KEY"
  require_csv_contains "XCONECTA_ALLOWED_ORIGINS" "${XCONECTA_HOST_PUBLIC_BASE_URL:-}" "xconecta allowed origins"
  require_csv_contains "XCONECTA_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTA_HOST_PUBLIC_BASE_URL:-}" "xconecta payment return allowlist"
fi
if [[ "${ENABLE_XCONECTB:-0}" == "1" ]]; then
  require_http_url "XCONECTB_PUBLIC_BASE_URL"
  require_non_empty "XCONECTB_TENANT_API_KEY"
  require_non_empty "XCONECTB_GUARD_INGEST_API_KEY"
  if [[ -z "${XCONECTB_TENANT_PAYMENT_RETURN_SECRET:-}" && -z "${XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF:-}" ]]; then
    echo "[xop-partners-examples-preflight] Missing required xconectb signing config: set XCONECTB_TENANT_PAYMENT_RETURN_SECRET or XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF"
    errors=$((errors + 1))
  fi
  require_csv_contains "XCONECTB_ALLOWED_ORIGINS" "${XCONECTB_PUBLIC_BASE_URL:-}" "xconectb allowed origins"
  require_csv_contains "XCONECTB_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTB_PUBLIC_BASE_URL:-}" "xconectb payment return allowlist"
  require_pair_if_any "XCONECTB_HOST_BOOTSTRAP_API_KEYS" "XCONECTB_HOST_BOOTSTRAP_SIGNING_SECRET" "xconectb host bootstrap"
  if [[ "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
    require_http_url "XCONECTB_HOST_PUBLIC_BASE_URL"
    require_http_url "XCONECTB_HOST_BACKEND_BASE_URL"
    require_http_url "XCONECTB_HOST_BOOTSTRAP_BACKEND_BASE_URL"
    require_non_empty "XCONECTB_HOST_BOOTSTRAP_API_KEY"
    require_csv_contains "XCONECTB_ALLOWED_ORIGINS" "${XCONECTB_HOST_PUBLIC_BASE_URL:-}" "xconectb allowed origins"
    require_csv_contains "XCONECTB_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTB_HOST_PUBLIC_BASE_URL:-}" "xconectb payment return allowlist"
  fi
elif [[ "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
  echo "[xop-partners-examples-preflight] ENABLE_XCONECTB_HOST=1 requires ENABLE_XCONECTB=1"
  errors=$((errors + 1))
fi
if [[ "${ENABLE_XCONECTC:-0}" == "1" ]]; then
  require_http_url "XCONECTC_PUBLIC_BASE_URL"
  require_non_empty "XCONECTC_TENANT_API_KEY"
  require_non_empty "XCONECTC_GUARD_INGEST_API_KEY"
  require_http_url "XCONECTC_PUBLISHER_API_URL"
  if [[ -z "${XCONECTC_TENANT_PAYMENT_RETURN_SECRET:-}" && -z "${XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF:-}" ]]; then
    echo "[xop-partners-examples-preflight] Missing required xconectc signing config: set XCONECTC_TENANT_PAYMENT_RETURN_SECRET or XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF"
    errors=$((errors + 1))
  fi
  require_csv_contains "XCONECTC_ALLOWED_ORIGINS" "${XCONECTC_PUBLIC_BASE_URL:-}" "xconectc allowed origins"
  require_csv_contains "XCONECTC_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTC_PUBLIC_BASE_URL:-}" "xconectc payment return allowlist"
  require_pair_if_any "XCONECTC_HOST_BOOTSTRAP_API_KEYS" "XCONECTC_HOST_BOOTSTRAP_SIGNING_SECRET" "xconectc host bootstrap"
  if [[ "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
    require_http_url "XCONECTC_HOST_PUBLIC_BASE_URL"
    require_http_url "XCONECTC_HOST_BACKEND_BASE_URL"
    require_http_url "XCONECTC_HOST_BOOTSTRAP_BACKEND_BASE_URL"
    require_non_empty "XCONECTC_HOST_BOOTSTRAP_API_KEY"
    require_csv_contains "XCONECTC_ALLOWED_ORIGINS" "${XCONECTC_HOST_PUBLIC_BASE_URL:-}" "xconectc allowed origins"
    require_csv_contains "XCONECTC_TENANT_PAYMENT_RETURN_URL_ALLOWLIST" "${XCONECTC_HOST_PUBLIC_BASE_URL:-}" "xconectc payment return allowlist"
  fi
elif [[ "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
  echo "[xop-partners-examples-preflight] ENABLE_XCONECTC_HOST=1 requires ENABLE_XCONECTC=1"
  errors=$((errors + 1))
fi
if [[ "${ENABLE_XPLACE_EXAMPLE:-1}" == "1" ]]; then
  require_non_empty "XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY"
  require_non_empty "XPLACE_EXAMPLE_XAPP_INGEST_API_KEY"
  require_non_empty "XPLACE_EXAMPLE_ADMIN_KEY"
  require_non_empty "XPLACE_EXAMPLE_DATABASE_URL"
  if [[ "${XPLACE_EXAMPLE_DATABASE_URL:-}" == *"host.docker.internal"* ]]; then
    echo "[xop-partners-examples-preflight] Warning: XPLACE_EXAMPLE_DATABASE_URL uses host.docker.internal."
    echo "[xop-partners-examples-preflight] That is usually only valid when PostgreSQL runs on the same host outside Docker."
  fi
else
  echo "[xop-partners-examples-preflight] ENABLE_XPLACE_EXAMPLE=1 is required for the public examples lane"
  errors=$((errors + 1))
fi

runtime_image="${XAPPS_RUNTIME_IMAGE:-xapps-runtime-partners-examples:local}"
php_runtime_image="${XAPPS_RUNTIME_PHP_IMAGE:-xapps-runtime-partners-examples-php:local}"
if [[ "${runtime_image}" == "xapps-runtime:local" && "${ALLOW_SHARED_RUNTIME_IMAGE:-0}" != "1" ]]; then
  echo "[xop-partners-examples-preflight] XAPPS_RUNTIME_IMAGE=${runtime_image} collides with unified image tag."
  echo "[xop-partners-examples-preflight] Use a dedicated lane tag (for example xapps-runtime-partners-examples:local) or set ALLOW_SHARED_RUNTIME_IMAGE=1 explicitly."
  errors=$((errors + 1))
fi
if [[ "${php_runtime_image}" == "xapps-runtime-php:local" && "${ALLOW_SHARED_RUNTIME_IMAGE:-0}" != "1" ]]; then
  echo "[xop-partners-examples-preflight] XAPPS_RUNTIME_PHP_IMAGE=${php_runtime_image} collides with unified image tag."
  echo "[xop-partners-examples-preflight] Use a dedicated lane tag (for example xapps-runtime-partners-examples-php:local) or set ALLOW_SHARED_RUNTIME_IMAGE=1 explicitly."
  errors=$((errors + 1))
fi

if [[ "${errors}" -gt 0 ]]; then
  echo "[xop-partners-examples-preflight] FAILED (errors=${errors})"
  exit 1
fi

echo "[xop-partners-examples-preflight] OK"
