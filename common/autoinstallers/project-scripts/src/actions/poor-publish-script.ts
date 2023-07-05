import '../include/prefix';
import { dirname, resolve } from 'path';
import { buildProjects, RushProject } from '@build-script/rush-tools';
import { ensureLinkTarget } from '@idlebox/ensure-symlink';
import { writeFileIfChange } from '@idlebox/node';
import { mkdirp, pathExistsSync, readFile } from 'fs-extra';
import { execPromise } from '../include/execPromise';

const yarnSuccessLine = /^success Published\.$/m;

function checkPnpmUploadLog(name: string, version: string, log: string) {
	console.error('------------------------------------------------------');
	console.error(log);
	console.error('------------------------------------------------------');
	console.error(`+ ${name}@${version}`);
	console.error('------------------------------------------------------');
	return log.includes(`+ ${name}@${version}`);
}

async function main(argv: string[]) {
	const rushProject = new RushProject();

	let skip = 0;
	{
		const index = argv.indexOf('--skip');
		if (index !== -1) {
			const skipArg = argv.splice(index, 2);
			skip = parseInt(skipArg.pop());
			if (isNaN(skip)) {
				throw new Error('--skip must with number (got ' + argv.join(' ') + ')');
			}
		}
	}

	const checkBin = rushProject.absolute('@build-script/poormans-package-change', 'bin/load.js');
	const pnpmBin = rushProject.getPackageManager().binAbsolute;

	const count = rushProject.projects.length;
	let current = 0;
	buildProjects({ rushProject, concurrent: 1 }, async (item) => {
		current++;
		console.error('📦 \x1B[38;5;14mPublishing package (%s of %s):\x1B[0m %s ...', current, count, item.packageName);

		if (--skip > 0) {
			console.error('    🛑 user request skip...');
			return;
		}

		if (!item.shouldPublish) {
			console.error('    🛑 should not publish, skip!');
			return;
		}

		let pkgJson: any;
		try {
			pkgJson = require(rushProject.absolute(item, 'package.json'));
		} catch (e) {
			throw new Error('package.json is invalid');
		}

		if (pkgJson.private) {
			console.error('    🛑 private package, skip!');
			return;
		}

		const stateFile = rushProject.tempFile(
			'proj_status/last-publish.' + item.packageName.replace('/', '__') + '.version.txt'
		);

		const lastPubVersion = pathExistsSync(stateFile) ? await readFile(stateFile, 'utf-8') : '-';
		if (lastPubVersion === pkgJson.version) {
			console.error('    🤔 no change: %s', lastPubVersion);
			return;
		}
		// console.error('    check...');

		const logFile = rushProject.tempFile('logs/do-publish/' + item.packageName.replace('/', '__') + '.log');
		const pkgPath = rushProject.absolute(item);

		const localNpmrc = resolve(pkgPath, '.npmrc');
		const configNpmrc = resolve(rushProject.configRoot, '.npmrc-publish');
		await ensureLinkTarget(configNpmrc, localNpmrc);

		// console.error('          log -> %s', logFile);
		await execPromise({
			cwd: pkgPath,
			argv: [checkBin, 'run-if-version-mismatch', '--', pnpmBin, 'publish', '--no-git-checks'],
			logFile,
		});
		// console.error('          complete.');
		const log = await readFile(logFile, 'utf-8');
		if (yarnSuccessLine.test(log) || checkPnpmUploadLog(pkgJson.name, pkgJson.version, log)) {
			console.error('    👍 success.');
		} else {
			console.error('    🤔 no update.', lastPubVersion, pkgJson.version);
		}

		await mkdirp(dirname(stateFile));
		await writeFileIfChange(stateFile, pkgJson.version);
	});
}

main(process.argv.slice(2)).then(
	() => {
		console.log(`\x1B[38;5;10mComplete.\x1B[0m `);
	},
	(e) => {
		console.error(e.stack);
		process.exit(1);
	}
);
