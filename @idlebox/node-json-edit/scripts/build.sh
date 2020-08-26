#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

if ! find lib/api -name '*.d.ts' | grep --fixed-string -q -- ".d.ts"; then
	rm -rf lib
fi

ttsc -p src

rm -f docs/package-public.d.ts
mkdir -p docs
find lib/api -name '*.d.ts' | xargs -n1 -IF bash -c "{ cat 'F' && echo ; } >> docs/package-public.d.ts"
