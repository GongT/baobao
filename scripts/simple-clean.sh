#!/usr/bin/env bash

set -Eeuo pipefail

set -- git clean -fdX
source "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/simple-each.sh"

rush install
