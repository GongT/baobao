import type { ISubArgsReaderApi } from '@idlebox/args';
import { limitEnum, requiredArg } from '../../common/args.js';

export const description = 'List project name or path or relative-path, can process with pipe.';
export const title = 'list peojct name/path';
export const usage = '<field>';
export const help = `Available fields:
	name
	path
	relpath

Options:
	-0 split with null byte (default newline)
`;

export enum CmdListWhat {
	name = 1,
	path,
	relpath,
}

export function parse(sub: ISubArgsReaderApi) {
	const what = limitEnum(CmdListWhat, requiredArg('field', sub.at(0)));

	if (typeof what !== 'number') {
		throw new Error('never');
	}
	return { what };
}
