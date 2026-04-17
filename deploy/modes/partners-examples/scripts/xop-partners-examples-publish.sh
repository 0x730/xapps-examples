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

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[xop-partners-examples-publish] ${ENV_FILE} not found. Create it from ${ENV_TEMPLATE_FILE}"
  exit 1
fi

set -a
source <(sed -e 's/\r$//' "${ENV_FILE}")
set +a

if [[ "${SKIP_PREFLIGHT:-0}" != "1" ]]; then
  ENV_FILE="${ENV_FILE}" bash "${SCRIPT_DIR}/xop-partners-examples-preflight.sh"
fi

if [[ "${ENABLE_XPLACE_EXAMPLE:-1}" != "1" ]]; then
  echo "[xop-partners-examples-publish] ENABLE_XPLACE_EXAMPLE=1 is required"
  exit 1
fi

gateway_url="$(printf '%s' "${INTERNAL_GATEWAY_BASE_URL:-https://gateway.0x730.com}" | sed 's:/*$::')"
xplace_example_public_base_url="$(printf '%s' "${XPLACE_EXAMPLE_PUBLIC_BASE_URL:-${XPLACE_EXAMPLE_BACKEND_BASE_URL:-}}" | sed 's:/*$::')"
version_conflict="${XOP_PUBLISH_VERSION_CONFLICT_EXAMPLE:-${XOP_PUBLISH_VERSION_CONFLICT:-allow}}"

if [[ -z "${xplace_example_public_base_url}" ]]; then
  echo "[xop-partners-examples-publish] XPLACE_EXAMPLE_PUBLIC_BASE_URL (or XPLACE_EXAMPLE_BACKEND_BASE_URL) is required for examples-lane publish"
  exit 1
fi

publish_disable_args=()
if [[ -z "${SUPERADMIN_API_KEY:-}" ]]; then
  publish_disable_args+=(
    --no-seed-gateway-payment-bundles
    --no-seed-gateway-notification-bundles
    --no-seed-gateway-invoice-bundles
  )
  echo "[xop-partners-examples-publish] SUPERADMIN_API_KEY not set; skipping gateway bundle secret seeding."
fi

run_profile_publish() {
  local profile="$1"
  local tenant_slug="$2"
  local tenant_api_key="$3"
  local policy_api_key="$4"
  local payment_url="$5"
  local guard_base_url="$6"
  local guard_ingest_api_key="$7"
  local tenant_payment_return_secret="$8"
  local tenant_payment_return_secret_ref="$9"

  if [[ -z "${tenant_api_key}" ]]; then
    echo "[xop-partners-examples-publish] ${profile} tenant API key is required"
    exit 1
  fi

  local publish_runner=(
    docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" run --rm --no-deps
    -e "SUPERADMIN_API_KEY=${SUPERADMIN_API_KEY:-}"
    -e "XPLACE_EXAMPLE_API_KEY=${XPLACE_EXAMPLE_API_KEY:-${XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY:-}}"
    -e "XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY=${XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY:-${XPLACE_EXAMPLE_API_KEY:-}}"
    -e "XPLACE_EXAMPLE_XAPP_INGEST_API_KEY=${XPLACE_EXAMPLE_XAPP_INGEST_API_KEY:-${XPLACE_EXAMPLE_GATEWAY_PUBLISHER_API_KEY:-${XPLACE_EXAMPLE_API_KEY:-}}}"
    -e "XPLACE_EXAMPLE_PUBLIC_BASE_URL=${xplace_example_public_base_url}"
    -e "XPLACE_EXAMPLE_BACKEND_BASE_URL=${xplace_example_public_base_url}"
    -e "XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY=${XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY:-}"
    -e "XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_SLUG_MAP=${XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_SLUG_MAP:-}"
    -e "XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_MAP=${XPLACE_EXAMPLE_TARGET_CLIENT_API_KEY_MAP:-}"
    -e "XPLACE_EXAMPLE_PORTAL_BASE_URL=${XPLACE_EXAMPLE_PORTAL_BASE_URL:-}"
    -e "XPLACE_EXAMPLE_PUBLISHER_BASE_URL=${XPLACE_EXAMPLE_PUBLISHER_BASE_URL:-}"
    -e "XPLACE_EXAMPLE_WEATHER_API_BASE_URL=${XPLACE_EXAMPLE_WEATHER_API_BASE_URL:-https://api.open-meteo.com}"
    -e "XPLACE_EXAMPLE_ANAF_API_BASE_URL=${XPLACE_EXAMPLE_ANAF_API_BASE_URL:-https://webservicesp.anaf.ro}"
    -e "XCONECTA_GUARD_INGEST_API_KEY=${XCONECTA_GUARD_INGEST_API_KEY:-xconecta-tenant-guard-dev-key}"
    -e "XCONECTA_TENANT_PAYMENT_RETURN_SECRET=${XCONECTA_TENANT_PAYMENT_RETURN_SECRET:-}"
    -e "XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF=${XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF:-}"
    -e "XCONECTB_GUARD_INGEST_API_KEY=${XCONECTB_GUARD_INGEST_API_KEY:-xconectb-tenant-guard-dev-key}"
    -e "XCONECTB_TENANT_PAYMENT_RETURN_SECRET=${XCONECTB_TENANT_PAYMENT_RETURN_SECRET:-}"
    -e "XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF=${XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF:-}"
    -e "XCONECTC_GUARD_INGEST_API_KEY=${XCONECTC_GUARD_INGEST_API_KEY:-xconectc-tenant-guard-dev-key}"
    -e "XCONECTC_TENANT_PAYMENT_RETURN_SECRET=${XCONECTC_TENANT_PAYMENT_RETURN_SECRET:-}"
    -e "XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF=${XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF:-}"
    xconecta
  )

  local publish_args=(
    npm run -s publish:xconect-xplace-example --
    --no-provision
    --reference-tenant-profile "${profile}"
    --gateway-url "${gateway_url}"
    --target-client-slug "${tenant_slug}"
    --xconect-policy-api-key "${policy_api_key}"
    --xconect-payment-page-url "${payment_url}"
    --xconect-guard-base-url "${guard_base_url}"
    --version-conflict "${version_conflict}"
    --root-env-file -
    --xconect-tenant-env-file -
    --xplace-env-file -
  )
  publish_args+=("${publish_disable_args[@]}")

  echo "[xop-partners-examples-publish] Publishing ${profile}+xplace-example to tenant=${tenant_slug} via ${gateway_url}..."
  "${publish_runner[@]}" "${publish_args[@]}"

  echo "[xop-partners-examples-publish] Triggering tenant-scoped post-publish refresh for tenant=${tenant_slug}..."
  local refresh_status
  refresh_status="$(curl -sS -o /tmp/xop-partners-examples-post-publish-refresh.$$ -w '%{http_code}' \
    -X POST \
    -H "x-api-key: ${tenant_api_key}" \
    -H "content-type: application/json" \
    "${gateway_url}/v1/installations/post-publish-refresh" \
    -d '{}')" || refresh_status="000"
  if [[ "${refresh_status}" == "404" ]]; then
    echo "[xop-partners-examples-publish] Gateway does not expose /v1/installations/post-publish-refresh yet; skipping refresh."
  elif [[ "${refresh_status}" != "200" ]]; then
    echo "[xop-partners-examples-publish] post-publish refresh failed for tenant=${tenant_slug} (HTTP ${refresh_status})."
    cat "/tmp/xop-partners-examples-post-publish-refresh.$$" || true
    rm -f "/tmp/xop-partners-examples-post-publish-refresh.$$"
    exit 1
  fi
  rm -f "/tmp/xop-partners-examples-post-publish-refresh.$$"
}

run_profile_publish \
  xconecta \
  "${XCONECTA_TENANT_SLUG:-xconecta}" \
  "${XCONECTA_GATEWAY_API_KEY:-${XCONECTA_TENANT_API_KEY:-}}" \
  "${XCONECTA_POLICY_PUBLISHER_API_KEY:-xconecta-policies-dev-api-key}" \
  "${XCONECTA_TENANT_PAYMENT_URL:-${XCONECTA_PUBLIC_BASE_URL:-}/tenant-payment.html}" \
  "$(printf '%s' "${XCONECTA_TENANT_GUARD_BASE_URL:-${XCONECTA_API_URL:-${XCONECTA_PUBLIC_BASE_URL:-}}}" | sed 's:/*$::')" \
  "${XCONECTA_GUARD_INGEST_API_KEY:-xconecta-tenant-guard-dev-key}" \
  "${XCONECTA_TENANT_PAYMENT_RETURN_SECRET:-}" \
  "${XCONECTA_TENANT_PAYMENT_RETURN_SECRET_REF:-}"

if [[ "${ENABLE_XCONECTB:-0}" == "1" ]]; then
  run_profile_publish \
    xconectb \
    "${XCONECTB_TENANT_SLUG:-xconectb}" \
    "${XCONECTB_GATEWAY_API_KEY:-${XCONECTB_TENANT_API_KEY:-}}" \
    "${XCONECTB_POLICY_PUBLISHER_API_KEY:-xconectb-policies-dev-api-key}" \
    "${XCONECTB_TENANT_PAYMENT_URL:-${XCONECTB_PUBLIC_BASE_URL:-}/tenant-payment.html}" \
    "$(printf '%s' "${XCONECTB_TENANT_GUARD_BASE_URL:-${XCONECTB_API_URL:-${XCONECTB_PUBLIC_BASE_URL:-}}}" | sed 's:/*$::')" \
    "${XCONECTB_GUARD_INGEST_API_KEY:-xconectb-tenant-guard-dev-key}" \
    "${XCONECTB_TENANT_PAYMENT_RETURN_SECRET:-}" \
    "${XCONECTB_TENANT_PAYMENT_RETURN_SECRET_REF:-}"
fi

if [[ "${ENABLE_XCONECTC:-0}" == "1" ]]; then
  run_profile_publish \
    xconectc \
    "${XCONECTC_TENANT_SLUG:-xconectc}" \
    "${XCONECTC_TENANT_API_KEY:-}" \
    "${XCONECTC_POLICY_PUBLISHER_API_KEY:-xconectc-policies-dev-api-key}" \
    "${XCONECTC_TENANT_PAYMENT_URL:-${XCONECTC_PUBLIC_BASE_URL:-}/tenant-payment.html}" \
    "$(printf '%s' "${XCONECTC_TENANT_GUARD_BASE_URL:-${XCONECTC_API_URL:-${XCONECTC_PUBLIC_BASE_URL:-}}}" | sed 's:/*$::')" \
    "${XCONECTC_GUARD_INGEST_API_KEY:-xconectc-tenant-guard-dev-key}" \
    "${XCONECTC_TENANT_PAYMENT_RETURN_SECRET:-}" \
    "${XCONECTC_TENANT_PAYMENT_RETURN_SECRET_REF:-}"
fi

echo "[xop-partners-examples-publish] Publish completed."
