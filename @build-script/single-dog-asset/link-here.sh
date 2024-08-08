#!/usr/bin/env bash

set -Eeuo pipefail

TARGET="$(pwd)"
SOURCE="$(dirname "${BASH_SOURCE[0]}")/package"

echo -e ":: will link/copy assets\n\tfrom '$SOURCE'\n\tto   '$TARGET'"
read -r -p "Do you want to continue? [y/N] " response

if ! [[ $response =~ ^([yY][eE][sS]|[yY])$ ]]; then
	echo ":: canceled"
	exit 1
fi

copy() {
	local from="$SOURCE/$1" to="$TARGET/$2"
	if [[ -e $to ]]; then
		echo " - skip copy $2"
		return
	fi
	mkdir -p "$(dirname "$to")"
	echo " - copy $2"
	cp "$from" "$to"
}

link() {
	local from="$SOURCE/$1" to="$TARGET/$2" to_dir frel
	if [[ -L $to ]]; then
		unlink "$to"
	fi
	if [[ -e $to ]]; then
		echo " - skip link $2"
		return
	fi
	to_dir="$(dirname "$to")"
	mkdir -p "$(dirname "$to_dir")"
	frel=$(realpath -s --relative-to="$to_dir" "$from")
	echo " - link $2 ($frel)"
	ln -s "./$frel" "$to"
}

copy vscode/extensions.json .vscode/extensions.json
copy vscode/settings.json .vscode/settings.json
link editorconfig .editorconfig
copy gitattributes .gitattributes
copy gitignore .gitignore
copy LICENSE LICENSE
copy npmignore common/config/rush/.npmignore
link prettierignore .prettierignore
link prettierrc.js .prettierrc.js
link rush-pretty-package.json common/autoinstallers/rush-prettier/package.json
link rush-pretty-pre-commit common/git-hooks/pre-commit

echo ":: done"
