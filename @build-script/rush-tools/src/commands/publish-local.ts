import { resolve } from 'path';
import { execa } from 'execa';
import { pathExists } from 'fs-extra';
import { RushProject } from '../api/rushProject';
import { description } from '../common/description';

description(publishLocal, 'run pnpm/npm/yarn publish in single project');

export default async function publishLocal(argv: string[]) {
	if (!(await pathExists('package.json'))) {
		console.error('Must run inside project');
		process.exit(1);
	}
	const pkgJson = require(resolve(process.cwd(), 'package.json'));

	const rush = new RushProject();
	const project = rush.getPackageByName(pkgJson.name);

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
	console.log('\x1B[2m + %s publish %s\x1B[0m', bin, argv.join(' '));
	const p = await execa(bin, ['publish', ...argv], { stdio: 'inherit' });

	process.exit(p.exitCode);
}
