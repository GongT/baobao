import type { ISubArgsReaderApi } from '@idlebox/args';
import { limitEnum, requiredArg } from '../../common/args.js';

export const description = 'some node dependencies related tool';
export const title = 'dependency analyze and modify';
export const usage = 'type';
export const help = `Available types:
	graph
`;

const cmdMap = {
	graph: 'graph',
};

export function parse(sub: ISubArgsReaderApi) {
	const t = requiredArg('type', sub.command(Object.keys(cmdMap)));

	const type = limitEnum(cmdMap, t.value);
	return {
		type: type,
	};
}
