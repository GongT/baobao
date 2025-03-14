import type { ISubArgsReaderApi } from '@idlebox/args';

export const description = '`rush update` + `update-autoinstaller`';
export const title = 'install projects and autoinstallers';
export const usage = '';
export const help = '';

export function parse(sub: ISubArgsReaderApi) {
	return {
		extra: sub.range(0),
	};
}
