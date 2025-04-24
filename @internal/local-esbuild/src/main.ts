import { readFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { TscWrapper } from './export.js';
import { isFastMode, isWatchMode } from './library/args.js';
import { buildctx } from './library/context.js';

const currentPackage = resolve(process.cwd(), 'package.json');
const pkgJson = JSON.parse(await readFile(currentPackage, 'utf8'));
buildctx.withOptions((options) => {
	if (!pkgJson.devDependencies) {
		return;
	}

	const externals = Object.keys(pkgJson.devDependencies);
	options.external?.push(...externals);
});

await buildctx.create();
const tempDir = resolve(process.cwd(), 'temp/tsc-out');

let control: TscWrapper | undefined;
function shutdown(code: string | number = 0) {
	Promise.allSettled([
		rm(tempDir, { recursive: true, force: true }).catch(),
		control?.terminate().catch(),
		buildctx?.dispose().catch(),
	])
		.catch((e) => {
			console.error('warn: something not cleanup: %s', e.stack);
		})
		.finally(() => {
			process.exit(typeof code === 'number' ? code : 0);
		});
}

if (!isFastMode) {
	const resolvedTypescript = fileURLToPath(import.meta.resolve('typescript/package.json', currentPackage));
	const tsc = resolve(resolvedTypescript, '../bin/tsc');

	const args = [
		'--project',
		'src/tsconfig.json',
		'--pretty',
		'--noEmit',
		'false',
		'--preserveWatchOutput',
		'--outDir',
		tempDir,
	];
	if (isWatchMode) args.push('--watch');

	control = new TscWrapper(tsc, args);
	control.on('log', (msg) => console.log(msg));
	control.on('debug', (msg) => console.error(msg));
	control.on('start', (rebuild) => {
		if (rebuild) {
			process.stderr.write('\x1Bc');
		}
	});
}

if (isWatchMode) {
	if (control) {
		await control.waitNextCompile();
	}
	await buildctx.watch();

	process.on('beforeExit', shutdown);
	process.on('SIGINT', shutdown);
} else {
	if (control) {
		await control.waitQuit();
	}
	await buildctx.rebuild();
	shutdown(0);
}
