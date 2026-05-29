## nodejs

- deny importing builtin modules without 'node:' prefix.
- always use promise instead of callback API. For example, use `node:fs/promises` instead of `node:fs`.
- perfer using `import process from 'node:process'` instead of using global `process`.
- always use name `kind` for other language's `type`. for example, `FruitKind` instead of `FruitType`, `{ messageKind: SomeEnum }` instead of `{ messageType: SomeEnum }`.
- never use spawn methods from `node:process`, use `execa` instead.

## import

- deny use of commonjs: `require()` and `module.exports`.
- for local imports, `.js` extension is required, only allow relative paths or package private (imports).
- deny default export, only named exports are allowed.

```typescript

## error handling

caught error type must be `unknown`, not `any` or `Error`. Type convert to `Error` by using `convertCaughtError()` function, or `instanceof` for handling, or rethrow it without type conversion. Deny use of force type conversion.

the `convertCaughtError()` function is defined in `@idlebox/common`. check for dependency before use it, you not allowed to add `@idlebox/common` if not already exists.

For example:

```typescript
try {} catch (e) {
	// bad: force type conversion, may cause runtime error if e is not an Error
	const error = e as Error;
	console.error(error.message);
}
try {} catch (e) {
	// good: use convertCaughtError()
	const error = convertCaughtError(e);
	console.error(error.message);
}
try {} catch (e) {
	if (e instanceof TypeError) doSomething(); // good: instanceof
	else throw e; // good: rethrow without know it's type
}
```

## path

- prefer `resolve()` over `join()`. 
- prefer strings over `URL`.
- prefer `dirname(path)` over `resolve(path, '..')`, except multiple levels.
- prefer `import.meta.dirname` and `import.meta.filename` over `import.meta.url` when possible. only use `url` when definitely required.
- deny using `__dirname` and `__filename`.

## organize

- prevent anonymous regexp literals, name each one, best at module level.
	```typescript
	const oneWord = /\b[a-z]+\b/; // good, named
	someString.replace(oneWord, '~'); // good, named

	someString.replace(/\s+/g, ' '); // bad, anonymous
	```
- module level variables declaraion must before any functions, class.
- interface name should start with capital I when applicable.
- interface with high relatedness with a class or function should be declared just before the class or function. otherwise, it should be declared after variables, before functions or classes.
- class properties (including static ones) and abstract methods should be declared before constructor, group and order by meaning. getter/setter, methods should be declared after constructor. property with getter/setter may not same naming as the getter/setter, but must have a `_` prefix.

## logging

use loggers from `@idlebox/logger` if its is available as a dependency. otherwise `debug`. if no `debug` module, use `console` directly.

for `@idlebox/logger`:
- template string is supported and preferred, like `` logger.debug`Hello ${name}` ``
- complex variable in message should never be stringify (wrong: `` logger.debug`${JSON.stringify(some_object)} ``)
- there are "commands" support, the command always english and no spaces around '<>', no "arguments" is supported, one and only one variable must be provided. for example:
  - `` logger.warn`missing file: relative<${file}>` ``
  - `` logger.error`错误list<${mapObj}>` `` 
- supported commands is in `@idlebox/logger/src/functions/builtin-commands.ts`

We follow the convention of using standard error for logging, and standard output for normal output, like most linux command line tools. `@idlebox/logger` and `debug` both write to standard error.

Use `console.log` instead of `process.stdout.write` for normal output.

## online resources

* [Node.js Documentation](https://nodejs.org/api/)
* Context 7 MCP

Note: don't check context7 for this project itself, since it's no way up-to-date!
