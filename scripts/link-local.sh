#!/usr/bin/env bash

set -Eeuo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

cd ../../common/temp || exit 0

mkdir -p bin

if ! [[ -e bin/rush-tools ]]; then
	rm -f bin/rush-tools
	ln -sv ../../../@build-script/rush-tools/bin.mjs bin/rush-tools
fi

if ! [[ -e install-run/pnpm-workspace.yaml ]]; then
	cat <<-EOF >install-run/pnpm-workspace.yaml
		packages:
	EOF
fi
