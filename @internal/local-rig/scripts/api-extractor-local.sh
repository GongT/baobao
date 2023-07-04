#!/usr/bin/env bash

set -Eeuo pipefail

mkdir -p etc
./node_modules/local-rig/node_modules/@microsoft/api-extractor/bin/api-extractor run -l
