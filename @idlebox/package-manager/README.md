# Universal Node Package Manager

wrapper for several different package manager 

> unpm install a b c d

|invoke command|command when install|condition|
|---|---|---|
| npm | npm install a b c | `package-lock.json` exists |
| yarn | yarn add a b c | `yarn.lock` exists |
| pnpm | pnpm install a b c | `pnpm-lock.yaml` exists |
| rush | rush add --caret -p a -p b -p c | `rush.json` exists in any parent directory |

Supported command:

* `unpm install/i/add/a <...package-name>`
* `unpm install/i/add/a --dev/-d <...package-name>`
* `unpm uninstall/un/remove/rm/erase <...package-name>`
* `unpm run/r package-script`
* `unpm init`

Any other command/options will direct pass to the package manager.

do not support:
* `unpm --dev install xxxx`
* global install package

