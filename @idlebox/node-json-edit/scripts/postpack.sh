#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

find . -maxdepth 1 -name '*.tgz' | xargs --no-run-if-empty tar --strip-components=1 -tf | sed 's#^package/##g'

rm -rf lib
bash -x scripts/build.sh
