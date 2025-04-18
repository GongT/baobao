import { findUpUntilSync, pickFlag, wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { FSWatcher, WatchHelper } from '@idlebox/chokidar';
import { globSync } from 'glob';
import { dirname, resolve } from 'path';
import { GeneratorHolder, type IResult } from './library/code-generator-holder.js';

const argv = process.argv.splice(2);
const watchMode = pickFlag(argv, ['--watch', '-w']) > 0;
const project = argv.pop();
if (!project) {
	console.error('usage: $0 package-dir');
	process.exit(1);
}

if (argv.length > 0) {
	console.error('unknown arguments:', argv);
	process.exit(1);
}

const root = resolve(process.cwd(), project);
const files = globSync('**/*.generator.{ts,js}', { ignore: ['node_modules/**'], cwd: root, absolute: true });

async function main() {
	const logger = wrapConsoleLogger();

	const pkgRoot = findUpUntilSync(root, 'package.json');
	if (!pkgRoot) {
		throw new Error('failed find package.json from ' + root);
	}
	const generaters = new GeneratorHolder(logger, dirname(pkgRoot));
	generaters.makeGenerators(files, true);

	if (watchMode) {
		console.log('execute generators in watch mode.');
		const chokidar = new FSWatcher({ cwd: dirname(pkgRoot), ignoreInitial: true, atomic: 200 });
		async function runPass() {
			await wrapOutput(generaters.executeAll());
			watcher.reset();
			for (const file of generaters.watchingFiles) {
				watcher.addWatch(file);
			}
		}
		const watcher = new WatchHelper(chokidar, runPass);
		await runPass();
	} else {
		const code = await wrapOutput(generaters.executeAll());

		process.exit(code);
	}
}

function wrapOutput(p: Promise<IResult>) {
	return p
		.then((result) => {
			if (result.errors.length > 0) {
				console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s errors\x1B[0m', result.errors.length);
				for (const item of result.errors) {
					console.error(item);
				}
				return 1;
			}

			if (process.stdout.isTTY) {
				console.log(
					'\x1B[48;5;10m\x1B[K✅  Generate Complete, %s success %s unchanged.\x1B[0m',
					result.success,
					result.skip
				);
			}
			return 0;
		})
		.catch((e: any) => {
			console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s\x1B[0m', e.message);
			return 1;
		});
}

main();
