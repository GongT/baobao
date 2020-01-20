import "./lib/respawnSystemd"
import { getCurrentRushRootPath, resolveRushProjectBuildOrder } from '@idlebox/rush-tools';
import { spawn } from 'child_process';
import { mkdirpSync, writeFileSync } from 'fs-extra';
import { dirname, resolve } from 'path';

const root = getCurrentRushRootPath();
const needToWatch = resolveRushProjectBuildOrder()
	.map((
		list // filter sub projects
	) =>
		list.filter(({ projectFolder }) => {
			const path = resolve(root, projectFolder);
			const pkg = require(resolve(path, 'package.json'));
			return pkg.scripts && pkg.scripts.watch;
		})
	)
	.filter((list) => list.length);

const importSection = `
const { spawn } = require('child_process');

const needToWatch = ${JSON.stringify(needToWatch)};

`;
const script = importSection + '\n\n(' + mainScript.toString() + ')()';
const bootFilePath = resolve(__dirname, '../temp/scripts/watch-all-run.mjs');
mkdirpSync(dirname(bootFilePath));
writeFileSync(bootFilePath, script);

function mainScript() {
	const ps = [];
	for (const pList of needToWatch) {
		for (const project of pList) {
			const path = resolve(root, project.projectFolder);
			console.error(' + run watch: %s', path);
			const p = spawn(process.env.NPM_BIN, ['run', 'watch'], {
				cwd: path,
				stdio: 'inherit',
			});
			ps.push(p);
			p.on('exit', (code, signal) => {
				console.error('watch [%s] exit with %s', signal ? 'signal ' + signal : code);
				ps.forEach((p) => {
					p.kill('SIGINT');
				});
			});
		}
	}
}
