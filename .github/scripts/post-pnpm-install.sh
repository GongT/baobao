#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

pnpm env use --global latest
pnpm --global install npm@latest

if ! [[ $CI ]]; then
	echo "This script is intended to be run in CI environment only." >&2
	exit 1
fi

sed -i 's#registry.npmmirror.com#registry.npmjs.org#g' .npmrc
sed -i 's#registry.npmmirror.com#registry.npmjs.org#g' pnpm-workspace.yaml

{
	echo "-------------------------"
	printf "node version: %s (%s)\n" "$(node --version)" "$(command -v node)"
	printf "npm version: %s (%s)\n" "$(npm --version)" "$(command -v npm)"
	printf "pnpm version: %s (%s)\n" "$(pnpm --version)" "$(command -v pnpm)"
	printf "registry: %s\n" "$(pnpm config get registry)"
	printf "access: %s\n" "$(pnpm config get access)"
	printf "DEBUG: %s\n" "${DEBUG-'*not set*'}"
	echo "-------------------------"
} >&2
