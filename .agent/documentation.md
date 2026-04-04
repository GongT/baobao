# documentation

There are 5 types of package in our monorepo:

Some package are wrapper of other library or executable, their document should be focused on whats new to the original one, don't write details about the original library, just link to it.

This document written in TypoScript, but the same rule is applied to any languages, except it explicitly changed in each language's coding-style.

1. **private helpers**

their document will be bundled into it's main package

when writing document for their main package, you need also read their code to get enough information for some symbols in main package. no document is needed for these package itself.

when the main package is re-exporting symbols from private helper, the symbol should be treated as if it's defined in the main package.

 for example:
- @idlebox/node-error-codes - part of @idlebox/common
- @idlebox/errors - part of @idlebox/common
- @idlebox/cli-help-builder - part of @idlebox/cli
- @idlebox/cli-static-generator - part of @idlebox/cli

2. **bunch of functions**

they don't have a main purpose, their document is a list of description of each symbol.

the main challenge is to keep all important details, but drop unnecessary information to make the document clean and easy to read.

for example:
- @idlebox/browser
- @idlebox/browser-*
- @idlebox/common
- @idlebox/node

for these kind of package:
- you already have a joblist from tool `update-documents`, if not, execute it before continue.
- don't do work not listed, or if you think the human-maintained tool de-sync from reality, for example some listed file is missing, report them later.
- follow the steps from [this file](jobs/function-library-document.md)

3. **libraries**
they have a main purpose, their document should be focused on how to use it.

maybe they are also have some additional functions, place them at the end of the document, don't write too much details.

for example:
- everything in @idlebox scope except the ones mentioned above
- @mpis/client
- @mpis/server
- @mpis/shared

for this kind of package:
- follow the steps from [this file](jobs/normal-library-document.md)

4. **executable**

They have one or more executables, their document should be focused on what is and how to use.

sometimes they can be used as a library too, but you only need to make a list/table about call signatures, since all usage is already described at executable section.

for example:
- @gongt/pnpm-instead-npm
- @build-script/autoindex
- @build-script/biomejs-step-by-step
- @build-script/codegen
- @build-script/package-tools
- in @mpis scope, everything not listed in libraries section

for these kind of package:
- follow the steps from [this file](jobs/executable-document.md)

5. **internal and WIP packages**

They are not ready for public use, don't write documentation for them.

Packages can be one of above types, but also can be internal or WIP. This kind should always checked first. You can remember which package is private and check memory before write document.

for example:

- packages in `@internal/*`
- `private=true` in their `package.json`
- @build-script/baseline-rig

## repository plan

this is the overall steps to update documents.

1. check if the document branch is checked out at `docs` branch.
	- if not exists, stop working and tell user run `git clone --branch docs --single-branch --depth 3 https://github.com/gongt/baobao.git gh-docs`.
	- if exists but not up to date, run `git pull --ff-only` by yourself, if there is any error, immediately stop and report.
1. wait for actual works complete
1. commit docs changes, with commit message: `docs: update API documents for {list of packages with changes, separated by comma}`, no "what is change". don't push.


## additional notice

* read the source code, consult but don't trust comments.
* if some source code is not clear enough on logic, notice after all jobs complete.
* for any file written, there must be a `<!-- commit:xxx -->` comment at the very first line, with `xxx` is the commit hash of current workspace (not the docs folder), even there are files not committed. don't touch this in an unchanged document.
* remember this document will be hosted without source code, so when you write a link to source code, it should be a link to `https://github.com/gongt/baobao` (this package's git repo), not a relative path.
* it's encourage to use links to source code, but don't write too much. for example, a huge error codes enum, "this is a wrapper of [that]() tool" is good. but "you can see what is this function do by looking at [the source code]()" is not a good one.

## symbols rule

When a public or exported symbol is marked as `@internal` or `@private` or `@deprecated`, it should be treated as if it's not exist, no document is needed for it, and it should not be mentioned in the document of other symbols.

This is also appied to class methods or function arguments.

treat methods and properties the same. method is just a property with function type.

no more than 3 different examples for single symbol. strict syntax is not needed, for example, not important details can use a "..." to replace. if the usage is very simple, examples can be omitted.

arguments and return values should be documented only if they are not obvious. for example:
- you never need to document "`void` means no return value"
- no need describe well known types like: "a Promise that resolves to a SomeClass", just "SomeClass" is enough.

## title

h1 # only use once at the very beginning of the document, and it should be the name of the package, followed by a brief description.

h2 ## for sections, such as "Installation", "Usage", "API" etc, and each subpackage if exists.

In the main section, like "API":

h3 ### is not used

h4 #### for each symbol, such as function, class, variable etc. the title should be the name of the symbol.

h5 and below are free to use.

## templates and note for each symbol type

**function signature**

````markdown
#### calculateAdd

这个函数计算两个数字之和。

```typescript
function calculateAdd(a: bigint, b: bigint): bigint;
function calculateAdd(a: number, b: number): number;
```

**参数说明**
两个数字均支持 `number` 和 `bigint` 类型。但不能混用，必须是同一种类型。

**返回值**
返回两个数字的和，类型与输入参数相同。

**特殊说明**
这里是函数的特殊说明，如果有的话

**示例**
```typescript
calculateAdd(1, 2); // 返回 3
```

````

**class**

protected members should be at the end of method list, abstract ones should be at the beginning. private members should be ignored.

for symbols with same visibility, properties and methods should be mixed together. keep the order by how they are defined in codebase.

public members with `@protected` tag should be treated as protected.

members with `@virtual` tag should be treated as abstract.

````markdown
#### Stack

这个类实现了一个简单的栈数据结构。

##### constructor

```typescript
new Stack<T>(size: number);
```

**注意如果传入了 `size` 参数，栈的大小将被限制为该值，否则为无限大小。**

#### push

将一个元素压入栈顶。

```typescript
push(item: T): void;
```

#### resize (protected, abstract)

调整栈的大小。基类没有实现此方法。

```typescript
resize(newSize: number): void;
```

````

**variable, constants and enum**

these kind of symbols are usually simple, just a brief description is enough, no need for detailed explanation or examples.

they should be placed at the beginning of the document, before function and class definitions.

````markdown
#### 常量定义

```typescript
const MAX_SIZE: number = 100;
const DEFAULT_TIMEOUT: number = 5000;
```

#### 枚举类型

```typescript
enum Color {
  Red = "red",
  Green = "green",
  Blue = "blue"
}
```

````
