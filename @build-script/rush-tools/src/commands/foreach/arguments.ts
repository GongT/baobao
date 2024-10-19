import type { ISubArgsReaderApi } from '@idlebox/args';
import { execCommonArg, execHelp, execUsage } from './shared.js';

export const description = 'Run a command in every project directory';
export const title = 'run command in each project';
export const usage = execUsage;
export const help = `Options:
${execHelp}`;

export function parse(sub: ISubArgsReaderApi) {
	return {
		...execCommonArg(sub),
	};
}
