#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."
node ./common/scripts/install-run.js json5 json5 rush.json --out-file common/temp/rush.json
jq -r '.projects[].projectFolder' < common/temp/rush.json | xargs -n1 -IF bash -c "
declare -rx PROJECT='F'
cd \"\$PROJECT\"
pwd
set -x
$*
"
