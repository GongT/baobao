export const prettierrc = `// Documentation for this file: https://prettier.io/en/configuration.html
module.exports = {
  // We use a larger print width because Prettier's word-wrapping seems to be tuned
  // for plain JavaScript without type annotations
  printWidth: 110,

  // Use .gitattributes to manage newlines
  endOfLine: 'auto',

  // Use single quotes instead of double quotes
  singleQuote: true,

  // For ES5, trailing commas cannot be used in function parameters; it is counterintuitive
  // to use them for arrays only
  trailingComma: 'none'
};`;

export const prettierignore = `### NOTE: gitignore also applies to Prettier
# Rush files
common/changes/
common/scripts/
CHANGELOG.*

# Package manager files
pnpm-lock.yaml
yarn.lock
package-lock.json
shrinkwrap.json

# Build outputs
dist
lib

# Prettier reformats code blocks inside Markdown, which affects rendered output
*.md
`;

export const githook = `#!/usr/bin/env bash

echo --------------------------------------------
echo "Starting Git hook: pre-commit"

node common/scripts/install-run-rush.js COMMAND_NAME --staged
RET=$?

echo "Finished Git hook: pre-commit ($RET)"
echo --------------------------------------------

exit $RET
`;
