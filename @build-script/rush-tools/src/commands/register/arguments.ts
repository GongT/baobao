import type { ISubArgsReaderApi } from '@idlebox/args';
import { requiredArg } from '../../common/args.js';

export const description = 'add a new project to "projects" array in rush.json, skip if already exists';
export const title = 'register new project';
export const usage = '<project>';
export const help = 'project: path to a folder contains package.json';

export function parse(sub: ISubArgsReaderApi) {
	return {
		project: requiredArg('project', sub.at(0)),
	};
}
