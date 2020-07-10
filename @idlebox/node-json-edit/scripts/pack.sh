#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

rm -f *.tgz
rm -rf lib

bash -x scripts/build.sh

find lib -name '*.d.ts*' | xargs rm
