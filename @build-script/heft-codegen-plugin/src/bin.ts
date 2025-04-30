import { findUpUntilSync, pickFlag, wrapConsoleLogger } from '@build-script/heft-plugin-base';
import { startChokidar } from '@idlebox/chokidar';
import { glob, Ignore } from 'glob';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { GeneratorHolder, type IResult } from './library/code-generator-holder.js';
import { IgnoreFiles } from './todo/IgnoreFiles.js';

async function main() {
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
	const ignoreFile = findUpUntilSync(root, '.gitignore');
	const ignore = new Ignore([], { cwd: root });
	if (ignoreFile) {
		for (let line of readFileSync(ignoreFile, 'utf-8').split('\n')) {
			line = line.trim();

			if (line.startsWith('#')) continue;
			if (line.length === 0) continue;
			if (line.startsWith('!')) {
				console.error('ignore file: invert match not support now: %s', line);
				continue;
			}

			if (line.endsWith('/')) {
				ignore.add(`**/${line}**`);
			} else {
				ignore.add(`**/${line}`);
				ignore.add(`**/${line}/**`);
			}
		}
	}

	const files = await glob('**/*.generator.{ts,js}', {
		ignore,
		cwd: root,
		absolute: true,
	});

	const logger = wrapConsoleLogger();

	const pkgRoot = findUpUntilSync(root, 'package.json');
	if (!pkgRoot) {
		throw new Error(`failed find package.json from ${root}`);
	}
	const generaters = new GeneratorHolder(logger, dirname(pkgRoot));
	generaters.makeGenerators(files, true);

	if (watchMode) {
		console.log('execute generators in watch mode.');

		if (generaters.size === 0) {
			console.error(' !! no generator found.');
			process.exit(1);
		}

		const ignore = new IgnoreFiles();
		ignore.add('**/*.generated.ts');
		ignore.add('**/.*');

		const watcher = startChokidar(runPass, {
			// ignoreInitial: false,
			watchingEvents: ['add', 'change', 'unlink'],
			ignored: (path) => {
				const r = ignore.ignore(path);
				// if (r) console.log('[ignore] \x1B[%sm%s => %s\x1B[0m', r ? '38;5;9' : '0', path, r);
				return r;
			},
		});
		// (watcher as any).watcher.on('raw', (event: any, path: any) => {
		// 	console.log('=== raw event info:', event, path);
		// });
		// (watcher as any).watcher.on('all', (event: any, path: any) => {
		// 	console.log('=== all:', event, path);
		// });
		watcher.add(files);
		async function runPass(changes: string[]) {
			// console.log('======', changes);
			await wrapOutput(generaters.executeRelated(new Set(changes)));
			const towatch = generaters.getAllWatchingFiles();
			watcher.add(towatch);
			console.log(
				'👀 \x1B[2mwatching %d files for change (%d in project).\x1B[0m',
				towatch.length,
				towatch.filter((e) => !e.includes('/node_modules/')).length
			);
		}

		process.on('SIGINT', () => {
			console.log('\nSIGINT received, exiting...');
			Promise.all([watcher.dispose(), generaters.disposeAll()]).finally(() => {
				process.exit(0);
			});
		});

		process.on('SIGPIPE', () => {
			console.log('\nSIGPIPE received, print chokidar listener...');

			console.error(
				'expect:',
				watcher.expectedWatches.filter((e) => !e.includes('/node_modules/'))
			);
			console.error(
				'watches:',
				watcher.watches.filter((e) => !e.includes('/node_modules/'))
			);
		});

		await runPass(['']);
	} else {
		const code = await wrapOutput(generaters.executeAll());

		generaters.disposeAll();

		process.exit(code);
	}
}

function wrapOutput(p: Promise<IResult>) {
	console.error('\x1B[48;5;14m\x1B[K⚡  Start Generate\x1B[0m');
	return p
		.then((result) => {
			if (result.errors.length > 0) {
				console.error('\x1B[48;5;9m\x1B[K⚠️  Generate Fail: %s errors\x1B[0m', result.errors.length);
				for (const item of result.errors) {
					console.error('  * %s\n      in %s', item.error.message.replace('\n', ''), item.source);
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
