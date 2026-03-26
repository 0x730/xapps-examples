#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_DIR="$(cd "${SCRIPT_DIR}/../../.." && pwd)"
cd "${DEPLOY_DIR}"
source "${SCRIPT_DIR}/_xop_partners_examples.sh"

ENV_FILE="${ENV_FILE:-$(xop_partners_examples_env_file "${DEPLOY_DIR}")}"
COMPOSE_FILE="${COMPOSE_FILE:-$(xop_partners_examples_compose_file "${DEPLOY_DIR}")}"
ENV_TEMPLATE_FILE="${ENV_TEMPLATE_FILE:-$(xop_partners_examples_env_example_file "${DEPLOY_DIR}")}"
PROJECT_NAME="${PROJECT_NAME:-$(xop_partners_examples_project_name)}"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "[xop-partners-examples-reset] ${ENV_FILE} not found. Create it from ${ENV_TEMPLATE_FILE}"
  exit 1
fi

echo "[xop-partners-examples-reset] WARNING: removing ${PROJECT_NAME} containers and volumes."
docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" --env-file "${ENV_FILE}" down -v
