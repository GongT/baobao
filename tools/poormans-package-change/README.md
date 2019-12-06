# poormans-package-change

* Do you manage more than 10 package at same time?
* Did you forgot/lazy to tag previous version with git?
* Did you remember which package changed since last publish?
* Should you increase version and publish it again?

Run this now! It's FREE! :D
> detect-package-change --bump

### Usage

```
Usage: detect-package-change --registry ??? --dist-tag ??? --package ??? --bump
         registry: default to use system .npmrc
         dist-tag: default to "latest"
         package: default to ./ (this folder contains package.json)
         bump: increase patch version in package.json if change detected
```

Require `git` available on PATH.

Use `detect-package-change 2>/dev/null` to mute debug output.

Output:

* `changed no.` or `changed yes.` if stdout isTTY
* `{ changedFiles: [......], changed: true }` otherwise
* no output if `--bump` is set

The return code always 0 when success. no matter changed or not.

### What happens
1. download newest `package.json` from npm
1. compare `version` field with local package.json
	* If they are not equal, it means you already want to publish new version, then I will do nothing. 
1. download published tarball from npm
1. run `npm pack`/`yarn pack` locally
1. compare files in the two by running `git`
1. if anything not equal, you should publish a new version.
1. (if `--bump` is set) increase patch version in `package.json`


### other tools
> TODO: # package-changed    
Like `detect-package-change`, but return 0 if something changed, 1 nothing changed, error otherwise.    
Eg.     
```bash
if package-changed ; then
	yarn version --major
	yarn publish
fi
```


> run-if-version-mismatch [--quiet] -- command to run

Run a command, if local `version` in `package.json` is NOT same with npm registry.    
The `--` is required.

Eg.
```bash
run-if-version-mismatch --quiet -- yarn publish
```
