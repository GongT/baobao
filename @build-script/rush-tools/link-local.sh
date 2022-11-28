#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

{
	cd ../../common/temp

	mkdir -p bin
	cd bin

	if [[ -e rush-tools ]]; then
		exit 0
	fi

	rm -f rush-tools
	ln -s ../../../@build-script/rush-tools/bin.cjs rush-tools
} || true
