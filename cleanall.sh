#!/usr/bin/env bash

./foreach.sh -c 'git clean -f -d -X -e !node_modules -e !.idea -e !.vscode'
