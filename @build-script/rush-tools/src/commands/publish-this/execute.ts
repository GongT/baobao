import { exists } from '@idlebox/node';
import { execa } from 'execa';
import { readFile } from 'fs/promises';
import { resolve } from 'path';
import { RushProject } from '../../api/rushProject';
import type { ArgOf } from '../../common/args.js';

export async function runPublishThis({ extra }: ArgOf<typeof import('./arguments')>) {
	if (!(await exists('package.json'))) {
		console.error('Must run inside project');
		process.exit(1);
	}
	const pkgJson = JSON.parse(await readFile(resolve(process.cwd(), 'package.json'), 'utf-8'));

	const rush = new RushProject();
	const project = rush.getProjectByName(pkgJson.name);

	if (!project) {
		console.error('Must run inside rush project');
		process.exit(1);
	}

	if (!project.shouldPublish || pkgJson.private) {
		console.error('Project is private');
		process.exit(1);
	}

	await rush.copyNpmrc(project);

	const bin = rush.getPackageManager().binAbsolute;
	console.log('\x1B[2m + %s publish %s\x1B[0m', bin, extra.join(' '));
	const p = await execa(bin, ['publish', ...extra], { stdio: 'inherit' });

	process.exit(p.exitCode);
}
