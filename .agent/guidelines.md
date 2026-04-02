# Enforcing rules

Must follow:
- [locale rules](./locale.md)
- never use any version number other than command output or webfetch result. for example:
	- if you need to install `react`, then you must run `pnpm add react`, never edit `package.json` directly to add things like `"react": "^1.2.3"`.
- this project uses `pnpm` and `pnpx`, disallow using `npm` and `npx` or any other package manager.

# When programming language of user question is unclear:

- Inspect current workspace, assume the question is about that.
- If still unclear, ask user to specify the programming language.

# When write workspace code files:

- inline examples do not need to follow this rule.
- follow [code style rules](./coding-style.md).
- for each language, see files in [languages](./languages) directory for specific rules, skip if file does not exist.
	- for example, for typescript, see [this](./languages/typescript.md).
- never reformat code files before write, run your tools instead.

# Memory

This is not a forced rule.

you can summarize all used rules file into file(s), put it into memory storage, preventing read file everytime.

also be careful don't mix different job's rules together, writing code and create commit message may have different rules.
