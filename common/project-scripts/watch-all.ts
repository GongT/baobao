import * as test from '@idlebox/rush-tools';
import { spawn, spawnSync } from 'child_process';
import { writeFileSync } from 'fs';
import { userInfo } from 'os';
import { basename, dirname, resolve } from 'path';

//{ resolveRushProjectBuildOrder, eachProject, getCurrentRushRootPath }

console.log(test);
const commandExists = require('command-exists').sync;
const { mkdirpSync } = require('fs-extra');

const needToWatch = [];

console.log(resolveRushProjectBuildOrder());
process.exit(0);

const root = getCurrentRushRootPath();
for (const { projectFolder } of eachProject()) {
	const path = resolve(root, projectFolder);
	const pkg = require(resolve(path, 'package.json'));
	if (!pkg.scripts || !pkg.scripts.watch) {
		continue;
	}
	needToWatch.push(path);
}

console.log('%s projects to watch', needToWatch.length);

const importSection = `
import { spawn } from 'child_process';

const needToWatch = ${JSON.stringify(needToWatch)};

`;
const script = importSection + '\n\n(' + mainScript.toString() + ')()';
const bootFilePath = resolve(__dirname, '../temp/scripts/watch-all-run.mjs');
mkdirpSync(dirname(bootFilePath));
writeFileSync(bootFilePath, script);

const pmPath = resolve(root, 'common/temp/pnpm-local/node_modules/.bin/pnpm');

if (commandExists('systemd-run')) {
	console.log('using systemd-run');
	const cmds = [];
	const { uid, gid } = userInfo();
	if (uid > 0) {
		console.log('using sudo');
		cmds.push('sudo');
	}
	cmds.push(
		'systemd-run',
		//'--quiet',
		'--wait',
		'--collect',
		'--pipe',
		`--unit=rush-project-watch-${basename(root)}`,
		`--working-directory=${resolve(root, 'common/temp')}`,
		`--setenv=NPM_BIN=${pmPath}`
	);
	if (uid > 0) {
		cmds.push('--uid=' + uid);
	}
	if (gid > 0) {
		cmds.push('--gid=' + gid);
	}

	cmds.push(process.argv0, '--experimental-modules', bootFilePath);

	console.log('\x1B[2m%s\x1B[0m', cmds.join(' '));
	spawnSync(cmds[0], cmds.slice(1), {
		stdio: 'inherit',
	});
} else {
	console.log('using direct spawn');
	spawnSync(process.argv0, ['--experimental-modules', bootFilePath], {
		stdio: 'inherit',
	});
}

function mainScript() {
	const ps = [];
	for (const path of needToWatch) {
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
