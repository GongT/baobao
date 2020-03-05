import { createFile, readFile, stat, writeFile } from 'fs-extra';
import { resolve } from 'path';
import { PROJECT_ROOT } from '../inc/argParse';

export async function createIgnore() {
	const ignoreFile = resolve(PROJECT_ROOT, '.npmignore');
	if (
		!(await stat(ignoreFile).then(
			(item) => !!item,
			(_) => false
		))
	) {
		await createFile(ignoreFile);
	}
	const data = await readFile(ignoreFile, 'utf-8');
	const lines = data.split(/\n/g);
	if (lines.includes('lib/*.d.ts') && lines.includes('lib/**/*.d.ts')) {
		return;
	}
	if (!lines[lines.length - 1] && !lines[lines.length - 2]) {
		lines.pop();
	}
	lines.push('### export-all-in-one ###', 'lib/*.d.ts', 'lib/**/*.d.ts', '');
	await writeFile(ignoreFile, lines.join('\n'));
}
