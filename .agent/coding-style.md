# Coding Style

This is a guide for coding style.


**Language specific:**

- [typescript and javascript](./languages/typescript.md)
- [python](./languages/python.md)


**Config files:**

- [biome.json](../biome.json) in the root directory.

**Priority when conflict**

specific language > this file > config files

## naming

**file and directory names**: kebab-case, for example: `my-file.ts`, `my-directory`.

**function names, variables, methods, properties**: camelCase, for example: `myFunction()`, `myVariable`.

**class names**: PascalCase, for example: `MyClass`.

**constants**: UPPER_SNAKE_CASE, for example: `MY_CONSTANT`.

**logical private names**: prefix with underscore, for example: `export const _dontUseMe`.

## control flow

- use if-else over switch-case if most cases have less than 3 lines.

- return early if possible. For example:

```python
def my_function(x):
	if x < 0:
		return "negative"
	elif x > 0:
		return "positive"
	return "zero"
```

- get and check for containers, if the value will be used. For example:

```typescript
// bad
if (map.has(key)) return map.get(key);
// good
const value = map.get(key);
if (value !== undefined) return value;
// good - not using value
if (map.has(key)) doSomething();
```


## logging

prevent anonymous log, always have a searchable tag, for example:

```typescript
console.error(e); // bad: no tag
console.log("data: %s", data); // bad: tag is too generic, hard to search
console.log("[myFunction] argument is:", data); // good
console.trace(data); // good: the engine provides enough information, no need for extra tagging
```

**this also applies to any logging library**, `debug(data)` is also bad, even it has a tag, but that tag is not for search.

## code splitting

code should be split heavily, each file must have only one main symbol,

every package can have one or more tool file, they can be larger than normal, but they never depend on other files in current package.

## comments

follow rules in examples:


#### Bad comments:

**explaining what the code does, even it's non-obvious**
```python
a = 1 + 1 # add one by one
do_some_thing() # this function make a new file at the current directory
```

#### Good comments:

**explain non-obvious things**
```bash
for I in *.log ; do
	# Note: dotglob is enabled in the entrypoint
done
```

**log instead of comment**
```typescript
// not good enough:
if (...) {
	// 可能是权限问题导致的错误
	tryFixPermission();
}

// excellent:
if (...) {
	logger.verbose`可能是权限问题导致的错误，正在尝试修复...`;
	tryFixPermission();
}
```

**see also**
```typescript
function copiedFunction() {
	// https://stackoverflow.com/questions/12345678
}
function monkeyPatch() {
	// this is because of https://github.com/abc/def/issues/123
}
```

**naming a type**
```typescript
const userMapping: Record</*uid:*/string, Record</*gid:*/string, /*user_name:*/string>> = {};
```
