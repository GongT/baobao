#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

if [[ -d lib ]]; then
	if ! find lib/api -name '*.d.ts' | grep --fixed-string -- ".d.ts" &> /dev/null; then
		rm -rf lib
	fi
fi

echo "run ttsc..."
ttsc -p src

echo "create .d.ts file..."
rm -f docs/package-public.d.ts
mkdir -p docs
find lib/api -name '*.d.ts' | xargs -n1 -IF bash -c "{ cat 'F' && echo ; } >> docs/package-public.d.ts"
echo "Done."
