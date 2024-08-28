# node-package-tools

# Usage

```
node-package-tools <command> [--args]
```

or

```
njspkg <command> [--args]
```

## command: detect-package-change

```
Usage: njspkg detect-package-change --registry ??? --dist-tag ??? --package ??? --bump --json --quiet
         registry: default to use system .npmrc
         dist-tag: default to "latest"
         package: this folder contains package.json (default to ./)
         bump: increase patch version in package.json if change detected
		 json: print json output even if stdout is tty
		 quiet: disable verbose debug output to stderr
```

Require `git` available on PATH.

Output:

-   `{ changedFiles: [......], changed: true }` if `!process.stdout.isTTY` OR `--json` is set
-   `changed no.` or `changed yes.` if stdout isTTY AND `--json` is not set
-   no output if `--bump` is set

The return code always 0 if no error. no matter changed or not.

### What happens

1. download newest `package.json` from npm, and cache it at `${TMPDIR}/package-json-cache`
1. compare `version` field with local package.json
    - If they are not equal. Then I will do nothing and print "changed yes.".
1. download published tarball from npm
1. run `pnpm pack` locally, or `npm run prepack`+`npm pack` if no pnpm.
1. compare files in created `.tgz` file and downloaded one. (by running some magic `git` commands)
    1. if `--bump` is set, increase patch version in `package.json`
    2. if any file do not equal, print "changed yes.".
    3. if everything exact same, print "changed no."

## command: run-if-version-mismatch

```
Usage: njspkg run-if-version-mismatch [--quiet] -- <command to run>
	Eg: njspkg run-if-version-mismatch -- pnpm publish --no-git-checks
```

Run a command, if local `version` in `package.json` is NOT same with npm registry.  
**The `--` is required.**

# Example

```bash
# update package.json if something changed
njspkg detect-package-change --bump
# run pnpm publish if version is not same with npm
#    maybe modified by above command
#    maybe by hand
njspkg run-if-version-mismatch --quiet -- pnpm publish --no-git-checks
```
