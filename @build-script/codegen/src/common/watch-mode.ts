import { startChokidar, type IWatchHelper } from '@idlebox/chokidar';
import { registerGlobalLifecycle } from '@idlebox/common';
import { globSync } from 'glob';
import { generatorHolder } from './code-generator-holder.js';
import { IgnoreFiles } from './ignore-files.js';
import { Logger } from './output.js';
import { debugMode } from './shared.js';

const logger = Logger('watcher');

export function startWatchMode(roots: readonly string[]) {
	const watcher = createWatch(handleFileChanges);

	const folders = globSync(
		roots.map((p) => `${p}/**/`),
		{ ignore: ['node_modules/**'] },
	);
	watcher.add(folders);

	syncFilesToWatcher(watcher);
}

async function handleFileChanges(changes: string[]) {
	if (debugMode) {
		logger.warn('file changes:');
		for (const change of changes) {
			logger.debug(change);
		}
	}

	await generatorHolder.executeRelated(new Set(changes));
}

function syncFilesToWatcher(watcher: IWatchHelper) {
	generatorHolder.onComplete(() => {
		const towatch = generatorHolder.getAllWatchingFiles();
		watcher.add(towatch);

		notifyWatching(watcher);
	});
}

let notifyTimer: NodeJS.Timeout | undefined;
function notifyWatching(watcher: IWatchHelper) {
	if (!debugMode) {
		const watching = watcher.watches;
		logger.log(`👀 watching ${watching.length} files for change.`);
		return;
	}

	if (notifyTimer) clearTimeout(notifyTimer);
	notifyTimer = setTimeout(() => {
		notifyTimer = undefined;

		const watching = watcher.watches;
		const notModuleCount = watching.filter((e) => !e.includes('/node_modules/')).length;
		logger.log(`👀 watching ${watching.length} files for change (${notModuleCount} in project).`);

		const line = '='.repeat(process.stderr.columns || 80);
		console.error('\x1B[2m%s\r== watching files ', line);
		for (const item of watching) {
			console.error(item);
		}
		console.error('%s\x1B[0m', line);
	}, 1000);
}

function createWatch(runPass: (changes: string[]) => Promise<void>) {
	const watch_ignore = new IgnoreFiles();
	watch_ignore.add('**/*.generated.ts');
	watch_ignore.add('**/.*');

	const watcher = startChokidar(runPass, {
		// ignoreInitial: true,
		watchingEvents: ['add', 'change', 'unlink', 'addDir', 'ready'],
		ignored: (path) => {
			const r = watch_ignore.ignore(path);
			// if (r) console.log('[ignore] \x1B[%sm%s => %s\x1B[0m', r ? '38;5;9' : '0', path, r);
			return r;
		},
	});

	process.on('SIGPIPE', () => {
		logger.info('\nSIGPIPE received, print chokidar listener...');

		logger.info('expect:');
		for (const e of watcher.expectedWatches) {
			if (e.includes('/node_modules/')) continue;
			logger.log(`  - ${e}`);
		}
		logger.info('watches:');
		for (const e of watcher.watches) {
			if (e.includes('/node_modules/')) continue;
			logger.log(`  - ${e}`);
		}
	});

	// (watcher as any).watcher.on('raw', (event: any, path: any) => {
	// 	console.log('=== raw event info:', event, path);
	// });
	// (watcher as any).watcher.on('all', (event: any, path: any) => {
	// 	console.log('=== all:', event, path);
	// });
	// watcher.add(files);
	// watcher.add(await glob('**/', globOptions));

	registerGlobalLifecycle(watcher);

	return watcher;
}
