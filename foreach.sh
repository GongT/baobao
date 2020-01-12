#!/usr/bin/env bash

set -e
[[ -e @idlebox/rush-tools/lib ]] || {
	echo "the '@idlebox/rush-tools' package not built, can not use foreach."
	exit 1
}

./@idlebox/rush-tools/bin.js foreach "$@"
