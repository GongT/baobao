---
Don't read comment in this file, it's for human only.
---

# where is the document

- document is located at `gh-docs/@scope/package-name/llms.md`
- for packages without @scope, the path is `gh-docs/standalone/package-name/llms.md`

# how to write a documentation

you should read the codebase, and findout what is the main purpose of this package. which functions, classes are the main entry point for users, and which are just helpers.

for example, the `@idlebox/logger` provides two main functions: `createLogger` and `createRootLogger`, there are many helper functions, but also a important enum named `EnableLogLevel`, user need this enum to use the main functions, so it should be treated as part of main API.      
you can also see that logger library is using template literal, which is different from other libraries, so this must be described at the beginning of the document.

you should write the document focused on how to use the main API, and put other symbols to the API section.

when writing examples, you should try to find if there are any real world usage in the codebase, if there is, you can write a simplified version of it as example.

after writing the document, you should comapre it with the old document, if there is no real change, you can just keep the old document without modification..

## template

````markdown
# {package name}

这里是这个包的简要介绍，<=300 Chinese characters.

## Usage

{main section}

### Examples

## API

{api section}

## Reference

[see this](https://xxxxx)
````
