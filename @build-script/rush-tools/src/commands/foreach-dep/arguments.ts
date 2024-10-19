import type { ISubArgsReaderApi } from '@idlebox/args';
import { execCommonArg, execHelp, execUsage } from '../foreach/shared.js';

export const description = 'Run a command in every project directory, in build order';
export const title = 'run command in build order';
export const usage = execUsage;
export const help = `Options:
	--public: run only in public projects
	--build: run only in projects with build script
${execHelp}`;

export function parse(sub: ISubArgsReaderApi) {
	return {
		buildOnly: sub.flag('--build') > 0,
		publicOnly: sub.flag('--public') > 0,
		...execCommonArg(sub),
	};
}
