# install prettier to rush project

Basically same as document [here](https://rushjs.io/pages/maintainer/enabling_prettier/)

But this not using `pretty-quick`.

It's very like `pretty-quick` but for rush project only.

## usage:

```bash
pnpx @build-script/rush-pretty --install
```

## options:

-   `rush prettier --changed` or `rush prettier`: format changed files.
-   `rush prettier --staged`: same as `pretty-quick`.
-   `rush prettier --all`: format all files in git repo, no matter changed or not.

## special note:

1. You **must** use git repo. This script will not work without git.
1. gitignore and prettier ignore always merge (but not write to disk), you do not need copy `gitignore` content to `prettierignore`.
1. `--staged` format files in working tree, which has staged copy. Does not really care the file in the stage. This is also what `pretty-quick` do.
1. **Anything in newly added folder will not format before `git add`. Even with `--all` flag.**
