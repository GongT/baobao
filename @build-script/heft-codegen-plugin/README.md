## codegen [task] - 代码生成器

根据tsconfig搜索项目，找到所有以`XXX.generator.ts`结尾的文件，调用其中的generate函数，将结果写入`XXX.generated.ts`。

```ts
import type { FileBuilder, IOutputShim } from '@build-script/heft-codegen-plugin';

export async function generate(builder: FileBuilder, logger: IOutputShim) {
	return 'some-string';
	// or don't return to use builder content
}
```

建议：

-   在tsconfig中添加exclude: `**/*.generator.ts`
-   在`.gitignore`添加: `*.generated.ts`