import type { ISubArgsReaderApi } from '@idlebox/args';

export const description = 'Upgrade all dependencies of every project to the latest version';
export const title = 'upgrade dependencies';
export const usage = '';
export const help = `Options:
	--dry-run: do not write any file, just print what would be done
	--publish, -P: replace dependencies on filesystem with released version
	--skip-update: skip "rush update" after upgrade
`;

export function parse(sub: ISubArgsReaderApi) {
	return {
		dryRun: sub.flag('--dry-run') > 0,
		fixLocal: sub.flag('--publish') > 0,
		skipUpdate: sub.flag('--skip-update') > 0,
	};
}
