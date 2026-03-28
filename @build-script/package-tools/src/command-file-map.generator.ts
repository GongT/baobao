import type { GenerateContext } from '@build-script/codegen';
import { makeIndexFile } from '@idlebox/cli/builder';

export async function generate(ctx: GenerateContext) {
	ctx.logger.info`[INFO] 生成命令文件映射表 ${import.meta.dirname}`;

	ctx.watchFiles(`${import.meta.dirname}/commands/*.ts`);
	ctx.watchFiles(`${import.meta.dirname}/commands`);

	const content = await makeIndexFile(import.meta.dirname, ['commands/*.ts']);
	ctx.file('commands.ts').append(content);
}
