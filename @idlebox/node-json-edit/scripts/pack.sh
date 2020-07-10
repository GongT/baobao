#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

rm -rf lib
rm -f *.tgz
bash scripts/build.sh
