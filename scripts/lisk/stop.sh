#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

# A temporary dir created to make the docker-compose files from
# https://github.com/LiskHQ/lisk/tree/1.2.0/docker available.
# Only used as long as this script runs
TMP_DIR=$(mktemp -d "${TMPDIR:-/tmp}/lisk_stop.XXXXXXXXX")

(
  cd "$TMP_DIR"
  echo "Navigated to temp directory $(pwd)"
  git clone --depth 1 --branch 1.2.0 https://github.com/LiskHQ/lisk.git

  (
    cd "lisk/docker"
    cp .env.development .env

    make mrproper
  )
)
