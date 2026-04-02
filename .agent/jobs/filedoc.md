---
Don't read comment in this file, it's for human only.
---

# function library document plan

# packages in scope:

*each package is unrelated to others*

<!-- - [@idlebox/browser](../../@idlebox/browser) -->
<!-- - [@idlebox/browser-ant-design](../../@idlebox/browser-ant-design) -->
<!-- - [@idlebox/browser-react](../../@idlebox/browser-react) -->
- [@idlebox/common](../../@idlebox/common) and [@idlebox/errors](../../@idlebox/errors) at once, as `@idlebox/common`
<!-- - [@idlebox/node](../../@idlebox/node) -->

# repository plan

1. check if the document branch is checked out at `docs` branch.
	- if not exists, run `git clone --branch docs --single-branch --depth 3 https://github.com/gongt/baobao.git gh-docs` at the root of the project.
	- if exists but not up to date, run `git pull --ff-only`
	- if any error during this two step, immediately stop and report.
1. for each package in scope
	1. run the package document plan, with `gh-docs/{package name}` as the `document location`, and `src/` as the `source location`.
1. commit docs changes, with commit message: `docs: update API documents for {list of packages with changes, separated by comma}`, no "what is change". don't push.

# package document plan

1. for each non-git-ignored typescript file inside `src/`
	1. calculate the state location: `src/` -> `document location`, `.ts` -> `.md`
		for example: `@idlebox/common/src/utils/file.ts` -> `gh-docs/@idlebox/common/utils/file.md`
	1. find the `$commit_id` from document file header comment
	1. run git commands to get the diff of this file between that commit and the current state
		- if there is diff, or no previous document, or any error occurs, do next step
		- if there is no diff, delete previous document file and skip to next file
	1. update or create the document file with current content (by method described below) and `$commit_id`
		- if there is no valuable document content, treat the file as not exists, delete the document file if exists
1. write a `llms.md` file at state location, with content:
	1. `# Usage`
	1. `<!-- last update: ${current date in YYYY-MM-DD format} -->`
	1. a brief description for entire package in <=200 Chinese characters.
	1. concat all (changed and unchanged) document files:
		1. `### File: {relative path without 'src/'}` (eg. `### File: utils/file.ts`)
		1. document content without header comment
	1. combine and unique references if any


# how to write a document file

1. don't read old document content
2. read the source file and it's imported source files. 
	- if it import any library, also read it's document by using context7 or read it's readme.md. but don't read library's source code.
	- if it import a workspace package, don't describe it.
	- try next step without the need to reference non-workspace things, if it's necessary, write a link to it's document, no copy paste.
3. for each exported symbol not marked as `@internal` or `@private` or `@deprecated`, and not a simple re-export from other place:
	- explain it's type, usage, and example if possible:
	- ignore types and interfaces used by other exported symbols. (exception: if it's used multiple times, place this type at the bottom)
	- if it's a function, only explain each parameter and return value. the function type itself can be omitted since it's a function.
	- if it's a class, only explain the class itself and it's constructor, not it's members. but write a table of public members with their name and type, with a tiny description no more than 50 Chinese characters.
	- if it's a variable, keep the explanation short, and make a link to it's type definition if applicable. or inline the type definition if it's really small.
	- every symbol should be in a h5 section (`##### {symbol name}`)
4. for `@internal` or `@private` or `@deprecated` symbols:
	- write a comment at the bottom, with content: `<!-- {symbol name} is {internal|private|deprecated}\nType: {type} -->`

# additional weak rules

* read the source code, consult but don't trust comments.
* if some source code is not clear enough, notice after all jobs complete.
* don't describe well-known types like `Promise`, `EventEmitter`, `React.FC`, `NodeJS.ReadableStream`, etc.
