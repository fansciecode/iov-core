#!/bin/bash
set -o errexit -o nounset -o pipefail
command -v shellcheck > /dev/null && shellcheck "$0"

TM_VERSION=${TM_VERSION:-0.21.0}
BOV_VERSION=${BOV_VERSION:-v0.8.0}

chmod 777 "${BOV_DIR}"

docker run -v "${BOV_DIR}:/tendermint" \
  "iov1/tendermint:${TM_VERSION}" init

# replace genesis
mv  "${BOV_DIR}/config/genesis.json" "${BOV_DIR}/config/genesis.json.orig"

echo '
  {
    "wallets": [
      {
        "address": "b1ca7e78f74423ae01da3b51e676934d9105f282",
        "name": "admin",
        "coins": [
          {
            "whole": 123456789,
            "ticker": "CASH"
          },
          {
            "whole": 123456789,
            "ticker": "ALX"
          }
        ]
      }
    ],
    "tokens": [
      {
        "ticker": "CASH",
        "name": "Main token of this chain",
        "sig_figs": 6
      },
      {
        "ticker": "ALX",
        "name": "Another token of this chain",
        "sig_figs": 6
      }
    ]
  }
' > app_state.json

jq --argjson appState "$(<app_state.json)" '. + {"app_state" : $appState}'  "${BOV_DIR}/config/genesis.json.orig" \
> "${BOV_DIR}/config/genesis.json"

docker run -v "${BOV_DIR}:/data" "iov1/bnsd:${BOV_VERSION}" -home "/data" \
  init -i
