# esbuild 手动输出插件

esbuild本身的文件写入过程过于简易（实际上是用go实现的，虽然很快但功能太少了）

实际开发时很少能完全不修改就直接用。

由于每个项目都复制一份写文件的代码非常难以维护，所以有了这个插件。

## 用法

```ts
import { CustomFileWriter } from '@build-script/esbuild-custom-writer';

const ctx = await esbuild.context({
	/// ...blabla
	plugins: [new CustomFileWriter(/* options */)],
});
```

参数：

```ts
interface options {
// 这个插件顺便实现了[这个插件](https://marketplace.visualstudio.com/items?itemName=connor4312.esbuild-problem-matchers)要求的输出样式，默认为true
	quiet?: boolean;
	emit?: (file: string, content: Buffer, hash: string) => Promise<void>;
	cache?: boolean;
	delete?: boolean;
}
```

每个文件调用一次，需要在此回调中实际执行`fs.writeFile()`
这个插件实现了一个缓存功能，如果文件的hash没有变，则会跳过`emit`回调，设为`false`禁用此功能
