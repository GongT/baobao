#!/usr/bin/env bash

set -Eeuo pipefail

yes "$(head -c 100 /dev/urandom)" | head -c 1600MB >1_6gb.bin
