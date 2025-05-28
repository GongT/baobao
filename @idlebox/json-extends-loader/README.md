# json extends loader

读取链式json配置文件。例如：

```json
{
	"extends": "...",
	// ...
}
```

## 用法：

```ts
import { loadInheritedJson } from '@idlebox/json-extends-loader';

const config = loadInheritedJson('src/tsconfig.json', { cwd: __dirname });
```

## 选项（第二个参数）

全部为可选项。

| 参数           | 类型                                                    | 默认值                                                                       | 说明                                                         |
| -------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------ |
| readJsonFile   | `(absPath: string) => any` 即 `IJsonLoader`             | 使用[comment-json](https://www.npmjs.com/package/comment-json)读取并解析文件 | 读取指定文件，你可以通过此函数读取任何内容（如yaml）         |
| cwd            | `string`                                                | `process.cwd()`                                                              | 如果第一个参数是相对路径，则与cwd拼接，否则无影响            |
| extendsField   | `string`                                                | `"extends"`                                                                  | 将"extends"更换为其他字段名                                  |
| nodeResolution | `boolean`                                               | `true`                                                                       | 若为false，则不搜索node_modules，只能继承相对路径            |
| arrayMerge     | `<T>(target: T[], source: T[], options?: Options): T[]` | 后者简单覆盖前者                                                             | 参考[deepmerge](https://www.npmjs.com/package/deepmerge)文档 |

## 额外的工具方法

#### readJsonFile(filePath: string): any

使用[comment-json](https://www.npmjs.com/package/comment-json)读取并解析json文件。

这是readJsonFile选项的默认值。


#### createDynamicReader(processor: IProcess): IJsonLoader

```ts
interface IProcess {
	(file: string, data: any): void;
}
```

返回一个函数，可用于`readJsonFile`选项。你可以在此回调中修改`data`。

### const tsconfigReader: IJsonLoader

预定义的loader，可作为`readJsonFile`选项使用。

为加载`tsconfig.json`优化

- 解析许多与路径相关的选项。例如 outDir、rootDir

### class NotFoundError

错误对象
