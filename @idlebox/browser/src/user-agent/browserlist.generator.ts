import type { GenerateContext } from '@build-script/codegen';

export async function generate(context: GenerateContext) {
	const { getUserAgentRegex } = await import('browserslist-useragent-regexp');
	const list = context.file('browserlist.ts');

	const regexp = getUserAgentRegex({
		allowHigherVersions: true,
		browsers: ['defaults', 'fully supports wasm', 'fully supports cryptography'].join(' and '),
	});

	list.append('export const browserlistSupport =');
	list.append(`\t${regexp.toString()};`);
}
