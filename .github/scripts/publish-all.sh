#!/usr/bin/env bash
set -Eeuo pipefail
shopt -s inherit_errexit extglob nullglob globstar lastpipe shift_verbose

cd .package-tools/publish
ls -l

echo "//registry.npmjs.org/:_authToken=${NPM_TOKEN}" >> .npmrc

mapfile -t packages < <(find . -name '*.tgz')
for pkg in "${packages[@]}"; do
	echo "::group::Publishing $pkg..."
	pnpm publish "$pkg"
	echo "::endgroup::"
done
