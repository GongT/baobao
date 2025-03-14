# esbuild 手动输出插件

esbuild本身的文件写入过程过于简易（实际上是用go实现的，虽然很快但功能太少了）

实际开发时很少能完全不修改就直接用。

由于每个项目都复制一份写文件的代码非常难以维护，所以有了这个插件。

## 用法

```ts
import { CustomFileWriter } from '@build-script/esbuild-custom-writer';

const writePipeline = new CustomFileWriter(/* options */);

writePipeline.onEmitFile((file: IFile) => {
	return file;
});

const ctx = await esbuild.context({
	/// ...blabla
	plugins: [writePipeline],
});
```

### 参数：

```ts
interface options {
	// 这个插件顺便输出了错误信息，默认为true
	quiet?: boolean;
	// 如果hash不变，则不写入文件，默认为true（这个判断在回调之后，可以修改hash）
	cache?: boolean;
	// 是否删除上次输出的文件，默认为true。注意这只对修改同一文件生效，源文件删除的情况不会处理。
	delete?: boolean;
}
```

### onEmitFile:

每个文件调用一次。此时可以修改文件路径、内容、hash。参数参考 [这个文件](./src/include/file.ts)
