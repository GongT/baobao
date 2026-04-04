---
Don't read comment in this file, it's for human only.
---

# where is the document

- document is located at `gh-docs/@scope/package-name/llms.md`
- for packages without @scope, the path is `gh-docs/standalone/package-name/llms.md`

# how to write a documentation

- you need to read the old documentation and the git log. after reading the code, if you found there are no big changes, for example only fix bugs or reimplement algorithm, you can just finish your work without any modification.
- you can run the command `package-name --help` to get the usage of the package, and then copy the output to the Usage section. note: use stdout only. All my packages have a usage output, if there is no output or something goes wrong, you should stop and report.
- the README.md file, test and examples folder should also be considered.
- some packages may have `*.schema.json` files, which are important for users, should also consider as part of codebase.
- some packages have special kind of config file, for example `@idlebox/codegen` need a script file to run, you can find them as examples in the other packages in codebase.

## Template

````markdown
# Package Name - Short description of the package

为什么要写这个包？这个包解决了什么问题？为什么这个包是有用的？（不超过100字）

## Usage

```bash
{package --help output place here}
```

## API

{main API section}
````
