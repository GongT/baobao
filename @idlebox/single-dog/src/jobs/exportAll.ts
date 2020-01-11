import { spawnSyncLog } from '../inc/spawn';

export function runExportAllInOne(target: string) {
	spawnSyncLog('node', [require.resolve('@idlebox/export-all-in-one-inject/bin.js'), target], {
		stdio: 'inherit',
		cwd: CONTENT_ROOT,
	});
}