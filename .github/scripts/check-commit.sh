#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

summ() {
	echo "$@" >>"${GITHUB_STEP_SUMMARY}"
}

x() {
	echo "  + $*" >&2
	"$@"
}

x sudo git config --system user.name "$(git log -n 1 --pretty=format:%an) (action bot)"
x sudo git config --system user.email "$(git log -n 1 --pretty=format:%ae)"

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

	<summary>本次git提交的文件列表</summary>

	\`\`\`log
	$(git diff --name-only)
	\`\`\`

	</details>

	### 修改的包
EOF

git add .

CMFILE="${RUNNER_TEMP:-/tmp}/commit-message.txt"
echo "chore: 🤖 update package versions [skip ci]" >"$CMFILE"
echo "" >>"$CMFILE"

mapfile -t packages < <(find .package-tools/publish -name '*.tgz' | xargs -I {} basename {} .tgz)
for pkg in "${packages[@]}"; do
	summ "- ${pkg}"
	printf " * %s\n" "${pkg}" >>"$CMFILE"
done

git commit -F "$CMFILE"
git push
echo "pushed!"
