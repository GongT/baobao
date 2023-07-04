# json extends loader

Read json config file chains. Like:

```json
{
	"extends": "...",
	...
}
```

## Usage:

```ts
import { loadInheritedJson } from '@idlebox/json-extends-loader';

const config = loadInheritedJson('src/tsconfig.json', { cwd: __dirname });
```

## Options (2nd argument)

All optional.

| param          | type                                                    | default                               | description                                                                |
| -------------- | ------------------------------------------------------- | ------------------------------------- | -------------------------------------------------------------------------- |
| readJsonFile   | `(absPath: string) => any` i.e. `IJsonLoader`           | read file and parse by `comment-json` | read given file, you can read anything (eg. yaml) by this function         |
| cwd            | `string`                                                | `process.cwd()`                       | if 1st arg is relative, join it with cwd, otherwize no effect              |
| extendsField   | `string`                                                | `"extends"`                           | change "extends" to other field name                                       |
| nodeResolution | `boolean`                                               | `true`                                | if false, node_modules is not searched, only able to extends relative path |
| arrayMerge     | `<T>(target: T[], source: T[], options?: Options): T[]` | simple override by later value        | [see this](https://www.npmjs.com/package/deepmerge)                        |

## Utils

#### readJsonFile(filePath: string): any

Read json file and parse by `comment-json`.

#### createDynamicReader(processor: IProcess): IJsonLoader

```ts
interface IProcess {
	(file: string, data: any): void;
}
```

create a function, feat for `readJsonFile` option. you can modify `data` as you want.

### const tsconfigReader: IJsonLoader

a pre-defined loader, can use when load `tsconfig.json`, it resolve many path-related option.

### class NotFoundError

Error object
