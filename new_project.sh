#!/usr/bin/env bash

P=$1
N="@idlebox/$(basename "$P")"

echo "create $N at $P"
mkdir -p "$P"
cd "$P"

echo "Log file at: $(basename "$P").init.log"
(
	set -ex
	yarn init -y
	jq -M --tab ". + {name: \"$N\"}" package.json > package.json.new
	mv package.json.new package.json
	../../tools/rush-tools/bin.js register-project .
	../../tools/build-script/bin/multi-call.js init
	../../tools/single-dog/bin.js
	../../tools/export-all-in-one-inject/bin.js src
) &> "$(basename "$P").init.log"
echo "Return code: $?"
