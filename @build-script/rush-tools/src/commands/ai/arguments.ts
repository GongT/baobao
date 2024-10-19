import type { ISubArgsReaderApi } from '@idlebox/args';
import { requiredArg } from '../../common/args.js';
export const description = 'run batch action in autoinstallers folder';
export const title = 'auto installer tool';
export const usage = '<command>';
export const help = `Available commands:
	update: run "pnpm install $@" in each auto-installer
	upgrade: run "pnpm upgrade $@" in each auto-installer
	link-local: create symlink of all auto-installers binary to common/temp/bin (you may want add this directory to PATH)
`;

export function parse(sub: ISubArgsReaderApi) {
	const action = requiredArg('command', sub.command(['update', 'upgrade', 'link-local']));
	const hit = action.value;

	if (hit === 'update' || hit === 'upgrade') {
		action.range(0);
	}

	return {
		action: hit,
		extra: action.range(0),
	};
}
