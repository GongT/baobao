#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

cd .package-tools/publish
ls -l

summ() {
	echo "$@" >>"${GITHUB_STEP_SUMMARY}"
}

declare -i ERRORS=0

summ ""
summ "## 发布包"

mapfile -t packages < <(find . -name '*.tgz')
for pkg in "${packages[@]}"; do
	echo "::group::Publishing $pkg..."
	if npm publish --access public --tag latest "$pkg"; then
		:
	else
		summ "  * $pkg 失败"
		printf "::error title=%s::%s\n\n" "failed to publish" "$(basename "$pkg" .tgz)"
		ERRORS+=1
	fi
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
