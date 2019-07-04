import { ensureDirSync, existsSync, readFileSync, writeFileSync } from 'fs-extra';
import { dirname } from 'path';

export function writeFileSyncIfChange(file: string, data: string) {
	if (existsSync(file) && readFileSync(file, 'utf8') === data) {
		// console.log('%s -> no change', relative(PROJECT_ROOT, file));
		return;
	}

	ensureDirSync(dirname(file));
	writeFileSync(file, data, 'utf8');
}
