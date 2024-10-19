import type { ISubArgsReaderApi } from '@idlebox/args';

export const description = 'run pnpm/npm/yarn publish in current project';
export const title = 'publish to nm';
export const usage = '';
export const help = '';

export function parse(sub: ISubArgsReaderApi) {
	return {
		extra: sub.range(0),
	};
}
