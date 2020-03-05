#!/usr/bin/env bash

set -e
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."
./common/temp/node_modules/.bin/json5 rush.json | jq -r '.projects[].projectFolder'  | xargs "$@"
