#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

echo -ne '\ec'

set -x
ttsc -p test
node "$@" -r source-map-support/register lib/testing/test/test.cjs
