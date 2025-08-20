#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

mkdir -p .publisher
cat <<-EOF >.publisher/pnpm-workspace.yaml
	packages:
	  - '*/package'
	  - '*/*/package'

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
EOF

print_list() {
	local C
	printf "\ec\e[38;5;2m" >&2
	while [[ $# -gt 1 ]]; do
		printf " * %s\n" "$1" >&2
		shift
	done
	printf "\e[38;5;11m * %s\n" "$1" >&2
	printf "\e[0m\n" >&2
}

RUNNED=()
run_in() {
	local DIR=$1
	if grep -qF '"private"' "${DIR}/package.json"; then
		RUNNED+=("skip private: ${DIR}")
		return
	fi

	EXEC=(pnpm -C "${DIR}" exec publisher extract)

	RUNNED+=("${EXEC[*]}")
	print_list "${RUNNED[@]}"

	"${EXEC[@]}"
}

mapfile -t DIRS < <(node @build-script/package-tools/load.js monorepo-list)
for DIR in "${DIRS[@]}"; do
	run_in "${DIR}"
done

pnpm -C .publisher install --prefer-frozen-lockfile --prefer-offline
