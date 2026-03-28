import type { GenerateContext } from '@build-script/codegen';
import { readFileSync } from 'node:fs';

logger.warn('global init from bbb...');

export function generate(ctx: GenerateContext) {
	ctx.logger.warn('Hello from bbb...');

	ctx.watchFiles('./source.txt')

	return `console.log("1234");

/*
${readFileSync(`${import.meta.dirname}/source.txt`, 'utf-8')}
*/
`;
}
