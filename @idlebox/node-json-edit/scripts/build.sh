#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

if [[ -d lib ]]; then
	if ! find lib/api -name '*.d.ts' | grep --fixed-string -- ".d.ts" &>/dev/null; then
		rm -rf lib
	fi
fi

echo "run ttsc..."
tsc -p src --declarationMap true
ttsc -p src --declarationMap false

echo "create .d.ts file..."
mkdir -p docs
mapfile -t ARR < <(find lib/api -name '*.d.ts')

echo '/// <reference types="node" />' >docs/package-public.d.ts
for I in "${ARR[@]}"; do
	echo "// file: $I"
	cat "$I"
	echo
	echo
done >>docs/package-public.d.ts

find lib -name '*.d.ts' -delete
echo "Done."
