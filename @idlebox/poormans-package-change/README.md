# poormans-package-change

* Do you manage more than 10 package at same time?
* Did you forgot/lazy to tag previous version with git?
* Did you remember which package changed since last publish?
* Should you increase version and publish it again?

Run this now! It's FREE! :D
> poormans-package-change detect-package-change --bump

# Usage

```
poormans-package-change <command> [--args]
```

## command: detect-package-change
```
Usage: poormans-package-change detect-package-change --registry ??? --dist-tag ??? --package ??? --bump --json --quiet
         registry: default to use system .npmrc
         dist-tag: default to "latest"
         package: default to ./ (this folder contains package.json)
         bump: increase patch version in package.json if change detected
		 json: print json output even if stdout is tty
		 quiet: disable verbose debug output to stderr
```

Require `git` available on PATH.

Output:

* `{ changedFiles: [......], changed: true }` if stdout !isTTY OR `--json` is set
* `changed no.` or `changed yes.` if stdout isTTY AND `--json` is not set
* no output if `--bump` is set

The return code always 0 if no error. no matter changed or not.

### What happens
1. download newest `package.json` from npm, and cache it at `${TMPDIR}/package-json-cache`
1. compare `version` field with local package.json
	* If they are not equal, it must modified by your-self. You are already know there are changes. Then I will do nothing and print "changed yes.". 
1. download published tarball from npm
1. run `npm pack`/`yarn pack` locally
1. compare files by running some `git` commands
1. if any file do not equal, you should publish a new version.
1. (if `--bump` is set) increase patch version in `package.json`


## command: run-if-version-mismatch
```
Usage: poormans-package-change run-if-version-mismatch [--quiet] -- <command to run>
	Eg: poormans-package-change run-if-version-mismatch -- yarn publish
```

Run a command, if local `version` in `package.json` is NOT same with npm registry.    
**The `--` is required.**
