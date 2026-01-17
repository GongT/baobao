#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose


mapfile -t PKG_PATHS < <(package-tools monorepo-list --has-version --has-name --no-private)
for PKG_PATH in "${PKG_PATHS[@]}"; do
	NAME=$(jq -r '.name' < "$PKG_PATH/package.json")
	printf '\ec\n\n\n\n'

	echo "https://www.npmjs.com/package/${NAME}/access"

	if [[  -n "${BROWSER:-}"  ]]; then
		"${BROWSER}" "https://www.npmjs.com/package/${NAME}/access"
	fi


	printf '\n\n\n\n'

	read -p "按下回车继续..."
done
