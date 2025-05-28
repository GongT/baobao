## codegen - 代码生成器

根据搜索指定目录中的所有 `.generator.ts` 结尾的文件，调用其中的 `generate` 函数，将结果写入 `.generated.ts`。


### TODOs

-  [ ] watch时增加删除生成器

### 使用

```bash
codegen ./root1 ./root2 ... ./rootN [--watch] [--debug]
```

### 生成器写法
```ts
import type { GenerateContext } from '@build-script/heft-codegen-plugin';

export async function generate(builder: GenerateContext) {
	logger.info('Generating code...');
	return 'console.log("Hello, world!");';
}

/** optional */
export async function dispose() {
	// do something
}
```

### 也可以这样写

```ts
import type { GenerateContext, ILogger } from '@build-script/heft-codegen-plugin';

class Generator {
	async generate(builder: GenerateContext) {}

	/** optional */
	async dispose() {}
}

export default new Generator();
```

### 可以生成多个文件

```ts
import type { GenerateContext } from '@build-script/heft-codegen-plugin';

export async function generate(builder: GenerateContext) {
	const someOtherFile1 = builder.file("base-name-of-file.tsx"); // 生成的文件名为 base-name-of-file.generated.tsx
	someOtherFile1.append("export function foo() { return <div />; }");

	return 'console.log("Hello, world!");';
}
```

##### 建议

-   在`.gitignore`添加: `*.generated.*`
