#!/usr/bin/env bash

set -Eeuo pipefail
cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"

pwd

echo "should import test.js:"
node ./index-cjs.js | sed "s#test\.js#\x1B[38;5;10m\\0\x1B[0m#g"
echo ""

echo "should import test.cjs:"
node -r .. ./index-cjs.js | sed "s#test\.cjs#\x1B[38;5;10m\\0\x1B[0m#g"
echo ""

echo "should import test.mjs:"
node --experimental-modules -r .. ./index-esm.mjs | sed "s#test\.mjs#\x1B[38;5;10m\\0\x1B[0m#g"
echo ""
