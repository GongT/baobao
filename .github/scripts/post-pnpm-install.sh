#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

pnpm env use --global latest
pnpm --global install npm@latest

sed -i 's#registry.npmmirror.com#registry.npmjs.org#g' .npmrc
sed -i 's#registry.npmmirror.com#registry.npmjs.org#g' pnpm-workspace.yaml

{
	echo "-------------------------"
	printf "node version: %s (%s)\n" "$(node --version)" "$(command -v node)"
	printf "npm version: %s (%s)\n" "$(npm --version)" "$(command -v npm)"
	printf "pnpm version: %s (%s)\n" "$(pnpm --version)" "$(command -v pnpm)"
	printf "registry: %s\n" "$(npm config get registry)"
	printf "registry: %s\n" "$(npm config get access)"
	echo "-------------------------"
} >&2
