#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")/.."

set -x

ttsc -p src
find lib/api -name '*.d.ts' | xargs cat > docs/package-public.d.ts
find lib -name '*.d.ts*' | xargs rm
