#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

summ() {
	echo "$@" >>"${GITHUB_STEP_SUMMARY}"
}

declare -i ERRORS=0

summ ""
summ "## 发布包"

ROOT_DIR="$(pwd)"
package_tools=(node "${ROOT_DIR}/@build-script/package-tools/load.js")
publisher=(node "${ROOT_DIR}/@mpis/publisher/loader/bin.js")

mapfile -t packages < <("${package_tools[@]}" monorepo-list --has-version --has-name --no-private)

if [[ ${#packages[@]} -eq 0 ]]; then
	summ "monorepo-list失败"
	echo "monorepo-list失败"
	exit 1
fi

for path in "${packages[@]}"; do
	pkg=$(jq -r '.name' < "$path/package.json")

	echo "::group::Publishing $pkg..."
	pushd "$path" &>/dev/null
	if "${publisher[@]}" publish --access public --no-git; then
		summ "  * $pkg 成功"
	else
		summ "  * $pkg 失败"
		printf "::error title=%s::%s\n\n" "failed to publish" "$pkg"
		ERRORS+=1
	fi
	popd &>/dev/null
	echo "::endgroup::"
done

summ ""
summ "## 发布结果"
summ "失败数量: $ERRORS"

if [[ $ERRORS -eq 0 ]]; then
	echo "所有包发布成功 🎉"
else
	echo "有 $ERRORS 个包发布失败 ❌"
	exit 1
fi
