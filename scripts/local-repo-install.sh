#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

cd .publisher
mapfile -t DIRS < <(node ../@build-script/package-tools/load.js monorepo-list)

cat <<-EOF >pnpm-workspace.yaml
	packages:
	  - '*'
	  - '*/*'

	enablePrePostScripts: false
	hoistWorkspacePackages: true

	onlyBuiltDependencies:
	  - '@biomejs/biome'
	  - esbuild

	autoInstallPeers: false
	nodeOptions: ''

	hoist: false
	hoistPattern:
	  - ""

	overrides:
EOF
for DIR in "${DIRS[@]}"; do
	NAME=$(jq -rM '.name' "${DIR}/package.json")
	echo "  '${NAME}': '${DIR}'" >>pnpm-workspace.yaml
done

pnpm install --prefer-frozen-lockfile --prefer-offline
