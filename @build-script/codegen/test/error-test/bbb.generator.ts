import type { GenerateContext } from '#self-reference';
import { randomString, throwError } from '../common/test-lib.js';

logger.warn('global init from bbb...');

export function generate(ctx: GenerateContext) {
	aaa();

	logger.info('Hello from bbb...');
	return `console.log("${randomString()}111");\n`;
}

function aaa() {
	bbb();
}

function bbb() {
	ccc();
}

function ccc() {
	if (1 - 0) throwError(1);
}
