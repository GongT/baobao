#!/usr/bin/env bash
# 此脚本在安装完成 pnpm 后、执行 pnpm install 之前运行

set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

pnpm --global runtime set node latest
pnpm --global add npm@latest

if ! [[ $CI ]]; then
	echo "This script is intended to be run in CI environment only." >&2
	exit 1
fi

sed -i 's#registry.npmmirror.com#registry.npmjs.org#g' .npmrc
sed -i 's#registry.npmmirror.com#registry.npmjs.org#g; s#verifyDepsBeforeRun: .+#verifyDepsBeforeRun: false#g' pnpm-workspace.yaml

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
