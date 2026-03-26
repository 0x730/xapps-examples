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
  echo "[xop-partners-examples-start] ${ENV_FILE} not found. Create it from ${ENV_TEMPLATE_FILE}"
  exit 1
fi

set -a
source <(sed -e 's/\r$//' "${ENV_FILE}")
set +a

if [[ "${SKIP_PREFLIGHT:-0}" != "1" ]]; then
  ENV_FILE="${ENV_FILE}" "${SCRIPT_DIR}/xop-partners-examples-preflight.sh"
fi

compose_up() {
  local profile_args=(
    --profile example-publisher
    --profile host-proof
    --profile tenant-b
    --profile tenant-b-host-proof
    --profile tenant-c
    --profile tenant-c-host-proof
  )
  docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" "${profile_args[@]}" up -d --no-build --remove-orphans
}

if [[ "${ENABLE_XCONECTB:-0}" != "1" && "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
  echo "[xop-partners-examples-start] ENABLE_XCONECTB_HOST=1 requires ENABLE_XCONECTB=1; forcing ENABLE_XCONECTB_HOST=0"
  export ENABLE_XCONECTB_HOST=0
fi

if [[ "${ENABLE_XCONECTC:-0}" != "1" && "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
  echo "[xop-partners-examples-start] ENABLE_XCONECTC_HOST=1 requires ENABLE_XCONECTC=1; forcing ENABLE_XCONECTC_HOST=0"
  export ENABLE_XCONECTC_HOST=0
fi

if [[ "${ENABLE_XPLACE_EXAMPLE:-1}" != "1" ]]; then
  echo "[xop-partners-examples-start] ENABLE_XPLACE_EXAMPLE=1 is required for the public examples lane"
  exit 1
fi

if [[ "${NO_BUILD:-0}" == "1" ]]; then
  if ! compose_up; then
    echo "[xop-partners-examples-start] compose up failed; retrying after service cleanup..."
    cleanup_services=(xconect xplace-example)
    if [[ "${ENABLE_XCONECT_HOST:-0}" == "1" ]]; then
      cleanup_services+=(xconect-host)
    fi
    if [[ "${ENABLE_XCONECTB:-0}" == "1" ]]; then
      cleanup_services+=(xconectb)
      if [[ "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
        cleanup_services+=(xconectb-host)
      fi
    fi
    if [[ "${ENABLE_XCONECTC:-0}" == "1" ]]; then
      cleanup_services+=(xconectc)
      if [[ "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
        cleanup_services+=(xconectc-host)
      fi
    fi
    docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" rm -f -s "${cleanup_services[@]}" || true
    compose_up
  fi
else
  build_services=(xconect xconectb xconectc xconectc-host)
  docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" build "${build_services[@]}"
  if ! compose_up; then
    echo "[xop-partners-examples-start] compose up failed after build; retrying after service cleanup..."
    cleanup_services=(xconect xplace-example)
    if [[ "${ENABLE_XCONECT_HOST:-0}" == "1" ]]; then
      cleanup_services+=(xconect-host)
    fi
    if [[ "${ENABLE_XCONECTB:-0}" == "1" ]]; then
      cleanup_services+=(xconectb)
      if [[ "${ENABLE_XCONECTB_HOST:-0}" == "1" ]]; then
        cleanup_services+=(xconectb-host)
      fi
    fi
    if [[ "${ENABLE_XCONECTC:-0}" == "1" ]]; then
      cleanup_services+=(xconectc)
      if [[ "${ENABLE_XCONECTC_HOST:-0}" == "1" ]]; then
        cleanup_services+=(xconectc-host)
      fi
    fi
    docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" rm -f -s "${cleanup_services[@]}" || true
    compose_up
  fi
fi

echo "[xop-partners-examples-start] Started ${PROJECT_NAME}."
