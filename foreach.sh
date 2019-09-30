#!/usr/bin/env bash

set -e
[[ -e tools/rush-tools/lib ]] || {
	echo "Not build, can not foreach"
	exit 1
}
./tools/rush-tools/bin.js foreach "$@"
