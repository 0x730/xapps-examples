#!/usr/bin/env bash
set -euo pipefail

xop_partners_examples_env_file() {
  local deploy_dir="$1"
  printf '%s\n' "${deploy_dir}/modes/partners-examples/env/xop-partners-examples.env"
}

xop_partners_examples_env_example_file() {
  local deploy_dir="$1"
  printf '%s\n' "${deploy_dir}/modes/partners-examples/env/xop-partners-examples.env.example"
}

xop_partners_examples_compose_file() {
  local deploy_dir="$1"
  printf '%s\n' "${deploy_dir}/modes/partners-examples/docker/xop-partners-examples.compose.yml"
}

xop_partners_examples_project_name() {
  printf '%s\n' "xop-partners-examples"
}
