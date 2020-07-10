#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

ttsc -p src

rm -f docs/package-public.d.ts
find lib/api -name '*.d.ts' | xargs -n1 -IF bash -c "{ cat 'F' && echo ; } >> docs/package-public.d.ts"
