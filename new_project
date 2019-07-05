#!/usr/bin/env bash

set -Eeo pipefail

cd "$(dirname "$(realpath "${BASH_SOURCE[0]}")")"
RUSH_ROOT=$(pwd)
trap '[[ -e "$RUSH_ROOT/new_project.log" ]] && cat "$RUSH_ROOT/new_project.log" || echo "Unknown error"' ERR

TYPE=$1
NAME=$2

if [[ -z "$NAME" ]] || [[ -z "$TYPE" ]]; then
	echo "Usage: $0 <type> <name>"
fi
ROOT="$TYPE/$NAME"

[[ -e "$RUSH_ROOT/new_project.log" ]] && unlink "$RUSH_ROOT/new_project.log"

echo "Creating directory..."
mkdir "$ROOT" # important: this will fail if exists.

echo "Initialize package.json..."
cat <<PACKAGE_JSON > "$ROOT/package.json"
{
	"name": "@idlebox/$NAME",
	"version": "1.0.0"
}
PACKAGE_JSON

TEMP_FILE="/tmp/$RANDOM.json"
echo "" > "$TEMP_FILE"
while IFS= read -r line
do
	echo "$line" >> "$TEMP_FILE"
	if [[ "$line" =~ ^[[:blank:]]*\"projects\": ]]; then
		cat <<RUSH_JSON >> "$TEMP_FILE"
		{
			"packageName": "@idlebox/$NAME",
			"projectFolder": "${ROOT}"
		},
RUSH_JSON
	fi
done < rush.json
cat "$TEMP_FILE" > rush.json
rm "$TEMP_FILE"

cd "$ROOT"
echo "Calling im-single-dog..."
node "$RUSH_ROOT/tools/single-dog/index.js" src &>"$RUSH_ROOT/new_project.log"

if [[ "$TYPE" == "library" ]]; then
	echo "Installing @microsoft/api-extractor..."
	rush add -p @microsoft/api-extractor --caret --dev -m &>"$RUSH_ROOT/new_project.log"

	echo "Updating dependencies..."
	rush update --full &>"$RUSH_ROOT/new_project.log"

	echo "Calling export-all-in-one..."
	node "$RUSH_ROOT/tools/export-all-in-one/index.js" src &>"$RUSH_ROOT/new_project.log"
else
	echo "Updating dependencies..."
	rush update --full &>"$RUSH_ROOT/new_project.log"
fi
