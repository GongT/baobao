# Commit messages

Commit message must follow the format below:

```
[package name 1] single line information about changes in this package
[package name 2] single line information about changes in this package

information about changes that don't belong to any package, if applicable
```

1. `package` is a subproject in this monorepo, which is located in a directory and contains a `package.json` file. You can find "package name" in the `package.json` file, package must have a `name` and `version` field, and must have no `private` field.

1. Each package's changes should be described in one line, with no more than 200 Chinese characters (or 400 characters).

1. Deny repeating the same package in multiple lines, for example, if you have two changes in the same package, please describe them in one line together.

1. If there are changes that don't belong to any package, you can describe them in the last part without a package name.

1. If a file is modified less than or equal to 2 times and each modification is less than or equal to 10 lines, then it is considered that the file has not been modified, deletion is considered as no modification.

1. Ignore anything inside `.vscode` and `.github` directory, except no change otherwise.

# Package change description rule

1. Don't menthion file names, function names, variable names, or any specific code symbols in the package change description.

# A good commit message example


	[@idlebox/node] 修复 README 中的一个拼写错误
	[@build-script/monorepo-lib] 添加对 package.yaml 的支持

	更新 README，添加新的使用示例
	修复了一个workflow.ts中的bug
