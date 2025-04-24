import { findUpUntilSync, pickFlag, wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { FSWatcher, WatchHelper } from '@idlebox/chokidar';
import { globSync } from 'glob';
import { dirname, resolve } from 'node:path';
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
		throw new Error(`failed find package.json from ${root}`);
	}
	const generaters = new GeneratorHolder(logger, dirname(pkgRoot));
	generaters.makeGenerators(files, true);

	if (watchMode) {
		console.log('execute generators in watch mode.');
		const chokidar = new FSWatcher({ cwd: dirname(pkgRoot), ignoreInitial: true, atomic: 200 });
		async function runPass() {
			await wrapOutput(generaters.executeAll());
			watcher.replaceWatch(generaters.watchingFiles);
			console.log('👀 \x1B[2mwatching %d files for change.\x1B[0m', watcher.size());
		}
		const watcher = new WatchHelper(chokidar, runPass);

		process.on('SIGINT', () => {
			console.log('\nSIGINT received, exiting...');
			Promise.all([watcher.dispose(), generaters.disposeAll()]).finally(() => {
				process.exit(0);
			});
		});

		await runPass();
	} else {
		const code = await wrapOutput(generaters.executeAll());

		generaters.disposeAll();

		process.exit(code);
	}
}

function wrapOutput(p: Promise<IResult>) {
	return p
		.then((result) => {
			if (result.errors.length > 0) {
				console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s errors\x1B[0m', result.errors.length);
				for (const item of result.errors) {
					console.error('  * %s\n      in %s', item.error.message, item.source);
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
