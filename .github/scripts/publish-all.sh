#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

cd .package-tools/publish
ls -l

summ() {
	echo "$@" >>"${GITHUB_STEP_SUMMARY}"
}

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >>.npmrc

summ ""
summ "## 发布包"

mapfile -t packages < <(find . -name '*.tgz')
for pkg in "${packages[@]}"; do
	echo "::group::Publishing $pkg..."
	if pnpm publish --tag latest "$pkg"; then
		:
	else
		summ "  * $pkg 失败"
		printf "::error title=%s::%s\n\n" "failed to publish" "$pkg"
	fi
	echo "::endgroup::"
done
