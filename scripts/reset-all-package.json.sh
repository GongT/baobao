#!/usr/bin/env bash

set -Eeuo pipefail

git diff --name-only | grep -E 'package\.json$' | xargs git checkout --
