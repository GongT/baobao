import type { GenerateContext } from '@build-script/codegen';
import { randomString } from '../common/test-lib.js';

logger.warn('global init from aaa...');

export function generate(ctx: GenerateContext) {
	logger.warn('Hello from aaa...');
	return `console.log("${randomString()}aaa");\n`;
}
