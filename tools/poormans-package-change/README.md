# poormans-package-change

* Do you manage more than 10 package at same time?
* Did you forgot/lazy to tag previous version with git?
* Do you remember which package changed since last publish?
* Should you increase version and publish it again?

run this now! It's FREE! :D
> detect-package-change --bump

### Usage

```
Usage: detect-package-change --registry ??? --dist-tag ??? --package ??? --bump
         registry: default to use system .npmrc
         dist-tag: default to "latest"
         package: default to ./ (this folder contains package.json)
         bump: increase patch version in package.json if change detected
```

Use `detect-package-change 2>/dev/null` to mute output.

Output:

* `changed no.` or `changed yes.` if stdout isTTY
* `{ changedFiles: [......], changed: true }` otherwise

return code always 0 when success.

### How
1. compare published version with local
	* If they are not equal, it means you already want to publish new version, then I will do nothing. 
1. download published tarball from npm
1. run `npm pack` at local
1. compare files by running `git`
1. if anything not equal, you must changed some file in this package, you should publish new version.
	* I can increase a patch version in `package.json` for you (by --bump)
