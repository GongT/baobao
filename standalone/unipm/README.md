# UNIversal node Package Manager

wrapper for several different package manager

> unipm install a b c d

| invoke command | command when install | condition                  |
| -------------- | -------------------- | -------------------------- |
| npm            | npm install a b c    | `package-lock.json` exists |
| yarn           | yarn add a b c       | `yarn.lock` exists         |
| pnpm           | pnpm install a b c   | `pnpm-lock.yaml` exists    |
| rush           | _a littel complex_   | `rush.json` exists         |

Supported command:

-   `unipm install/i/add/a <...package-name>`
-   `unipm install/i/add/a --dev/-d <...package-name>`
-   `unipm uninstall/un/remove/rm/erase <...package-name>`
-   `unipm run/r package-script`
-   `unipm init`

Any other command/options will direct pass to the package manager.

do not support:

-   global install package
