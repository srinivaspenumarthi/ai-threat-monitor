#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
STATE_DIR="${PROJECT_ROOT}/data/local-nginx"
CONF_PATH="${STATE_DIR}/site.conf"
PID_PATH="${STATE_DIR}/logs/nginx.pid"
ACCESS_LOG_PATH="${STATE_DIR}/logs/access.log"
ERROR_LOG_PATH="${STATE_DIR}/logs/error.log"

usage() {
  cat <<EOF
Usage:
  $(basename "$0") start /absolute/path/to/site [port]
  $(basename "$0") stop
  $(basename "$0") status

Examples:
  $(basename "$0") start /Users/name/Downloads/sastra-elibrary-main 8088
  $(basename "$0") stop
EOF
}

ensure_nginx() {
  if ! command -v nginx >/dev/null 2>&1; then
    echo "nginx is not installed. Run: brew install nginx"
    exit 1
  fi
}

write_config() {
  local site_dir="$1"
  local port="$2"

  mkdir -p "${STATE_DIR}/logs"

  cat >"${CONF_PATH}" <<EOF
pid ${PID_PATH};

events {}

http {
    access_log "${ACCESS_LOG_PATH}" combined;
    error_log "${ERROR_LOG_PATH}" warn;

    server {
        listen ${port};
        server_name localhost;

        root "${site_dir}";
        index index.html;

        location / {
            try_files \$uri \$uri/ /index.html;
        }
    }
}
EOF
}

start_site() {
  local site_dir="${1:-}"
  local port="${2:-8088}"

  if [[ -z "${site_dir}" ]]; then
    usage
    exit 1
  fi

  if [[ ! -d "${site_dir}" ]]; then
    echo "Site directory not found: ${site_dir}"
    exit 1
  fi

  ensure_nginx

  if [[ -f "${PID_PATH}" ]]; then
    nginx -p "${STATE_DIR}" -c "${CONF_PATH}" -s stop >/dev/null 2>&1 || true
    rm -f "${PID_PATH}"
  fi

  write_config "${site_dir}" "${port}"
  : >"${ACCESS_LOG_PATH}"
  : >"${ERROR_LOG_PATH}"

  nginx -p "${STATE_DIR}" -c "${CONF_PATH}"

  cat <<EOF
Local site is running.

Site URL:
  http://localhost:${port}

Access log:
  ${ACCESS_LOG_PATH}

Start the detector backend with:
  cd "${PROJECT_ROOT}/backend"
  export PATH="/opt/homebrew/bin:\$PATH"
  DEBUG=false NGINX_LOG_PATH="${ACCESS_LOG_PATH}" UV_CACHE_DIR=/private/tmp/uv-cache /opt/homebrew/bin/uv run --no-sync python -m app

Watch traffic with:
  tail -f "${ACCESS_LOG_PATH}"
EOF
}

stop_site() {
  ensure_nginx

  if [[ ! -f "${PID_PATH}" ]]; then
    echo "No local nginx demo process is running."
    exit 0
  fi

  nginx -p "${STATE_DIR}" -c "${CONF_PATH}" -s stop
  rm -f "${PID_PATH}"
  echo "Local site stopped."
}

status_site() {
  if [[ -f "${PID_PATH}" ]]; then
    echo "Local site appears to be running."
    echo "PID file: ${PID_PATH}"
    echo "Access log: ${ACCESS_LOG_PATH}"
  else
    echo "Local site is not running."
  fi
}

command_name="${1:-}"
case "${command_name}" in
  start)
    shift
    start_site "${1:-}" "${2:-8088}"
    ;;
  stop)
    stop_site
    ;;
  status)
    status_site
    ;;
  *)
    usage
    exit 1
    ;;
esac
