# UNIversal node Package Manager

wrapper for several different package manager

> unipm install (-D|--dev) a b c d

| invoke command | command when install | condition                  |
| -------------- | -------------------- | -------------------------- |
| npm            | npm install a b c    | `package-lock.json` exists |
| yarn           | yarn add a b c       | `yarn.lock` exists         |
| pnpm           | pnpm install a b c   | `pnpm-lock.yaml` exists    |
| rush           | _a littel complex_   | `rush.json` exists         |

Supported command:

-   `unpm install/i/add/a <...package-name>`
-   `unpm install/i/add/a --dev/-D <...package-name>`
-   `unpm uninstall/un/remove/rm/erase <...package-name>`
-   `unpm run/r package-script`
-   `unpm init`
-   `unpm format-package`: re-format package.json with prettier

[ ] `unpm update-latest`: update package.json dependency version, but don't run install

Any other command/options will direct pass to the package manager.

do not support:

-   global install package
