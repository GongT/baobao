#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

summ() {
	echo "$@" >>"${GITHUB_STEP_SUMMARY}"
}


git config --global user.name "$(git log -n 1 --pretty=format:%an) (action bot)"
git config --global user.email "$(git log -n 1 --pretty=format:%ae)"

summ -e "# 检测修改\n"

pnpm run publish-everything --dry

if [[ -z "$(git status --porcelain)" ]]; then
	summ "* 没有修改"
	echo "没有修改，跳过提交"
	exit 0
fi

echo "有修改，准备提交"

cat >>"${GITHUB_STEP_SUMMARY}" <<-EOF
	<details>

	<summary>修改文件列表</summary>

	\`\`\`log
	' "$(git diff --name-only)" '
	\`\`\`

	</details>

	### 修改的包
EOF

git add .

MESSAGE="chore: update package versions [skip ci]"
MESSAGE+=$'\n'

mapfile -t packages < <(find .package-tools/publish -name '*.tgz' | xargs -I {} basename {} .tgz)
for pkg in "${packages[@]}"; do
	summ "- ${pkg}"
	MESSAGE+=$(printf " * %s\n" "${pkg}")
done

git commit -m "$MESSAGE"
git push
echo "pushed!"
