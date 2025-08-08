import type { GenerateContext } from '@build-script/codegen';
import { makeIndexFile } from '@idlebox/cli/builder';

export async function generate(ctx: GenerateContext) {
	ctx.watchFiles(`${__dirname}/commands/*.ts`);
	ctx.watchFiles(`${__dirname}/commands`);

	const content = await makeIndexFile(__dirname, ['commands/*.ts']);
	ctx.file('commands.ts').append(content);
}
