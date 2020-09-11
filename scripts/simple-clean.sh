#!/usr/bin/env bash

set -Eeuo pipefail

find . -maxdepth 3 -mindepth 3 -name '*.log' | xargs --no-run-if-empty rm -f
find . -maxdepth 3 -mindepth 3 -name '*.tgz' | xargs --no-run-if-empty rm -f
