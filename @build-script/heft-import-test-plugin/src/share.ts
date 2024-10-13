import type { IOutputShim } from '@build-script/heft-plugin-base';
import type { IPackageJson, IPackageJsonExports } from '@rushstack/node-core-library';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';
import ts from 'typescript';

const signal = '\x00';

function tester(exports: any) {
	const signal = '\x00'; // for stringify
	const imports = exports?.default ?? exports;
	const info = {
		hasDefault: Object.hasOwn(exports, 'default'),
		symbolList: Object.keys(imports),
	};
	process.stdout.write('' + signal + JSON.stringify(info));
	process.exit(0);
}

export async function run(projectInput: string, logger: IOutputShim, tempdir: string = tmpdir()): Promise<string> {
	const pkgJsonPath = projectInput.endsWith('package.json')
		? resolve(process.cwd(), projectInput)
		: resolve(process.cwd(), projectInput, 'package.json');

	if (!existsSync(pkgJsonPath)) return `missing package.json`;

	const tempdirPrivate = resolve(tempdir, 'tmp.' + (Math.random() * 65535).toFixed(0));
	const projectRoot = dirname(pkgJsonPath);

	try {
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
		const errorMessages = await Promise.all(runInner(projectRoot, pkgJson, logger, tempdirPrivate));

		const errorMessage = errorMessages.filter((e) => e).join('');
		if (!errorMessage) return '';

		return errorMessage.replaceAll(tempdirPrivate, projectRoot).replace(`/node_modules/${pkgJson.name}`, '');
	} catch (e: any) {
		logger.warn(e.stack);
		return 'error during test';
	}
}

function isExportMap(exports: IPackageJson['exports']): exports is Record<string, null | string | IPackageJsonExports> {
	return !!exports && typeof exports === 'object' && !Array.isArray(exports);
}
function isObject(obj: any): obj is object {
	return !!obj && typeof obj === 'object';
}

function runInner(
	projectRoot: string,
	pkgJson: IPackageJson & Record<string, any>,
	logger: IOutputShim,
	tempdir: string,
): Promise<string | void>[] {
	const {
		name: pkgName,
		main: pkgMain,
		module: pkgModule,
		exports: pkgExports,
		types: pkgTypes,
		dependencies,
		devDependencies,
	} = pkgJson;

	let innerTypes;
	if (isExportMap(pkgExports) && isObject(pkgExports['.'])) {
		innerTypes = pkgExports['.']['types'];
	}

	for (const types of [innerTypes, pkgTypes]) {
		if (typeof types !== 'string') continue;

		logger.verbose('test file: ' + types);
		const dts = resolve(projectRoot, types);
		if (existsSync(dts)) {
			logger.verbose('  - exists.');
		} else {
			logger.verbose('  - file not found');
			return [Promise.resolve(`missing .d.ts file (should at ${dts})`)];
		}
	}

	if (pkgMain === undefined && pkgModule === undefined) {
		if (!pkgExports) {
			logger.verbose('no "exports" or "main" in package.json');
			return [Promise.resolve()];
		}
		if (isExportMap(pkgExports) && !pkgExports['.']) {
			logger.warn('no default exports in package.json, current not support');
			return [Promise.resolve()];
		}
	}

	mkdirSync(tempdir, { recursive: true });
	logger.verbose(`using temp dir: ${tempdir}`);
	process.on('exit', () => {
		if (process.env['NO_DELETE_TEMP']) {
			logger.log(`not deleting temp dir: ${tempdir} (reason: NO_DELETE_TEMP)`);
		} else {
			logger.verbose(`deleting temp dir: ${tempdir} (set $env:NO_DELETE_TEMP=yes to skip)`);
			rmSync(tempdir, { recursive: true });
		}
	});

	const spec = JSON.stringify(pkgName);

	const script1 = resolve(tempdir, 'import.js');
	writeFileSync(script1, `${tester.toString()}import ${spec};import * as items from ${spec};tester(items);`);
	const script2 = resolve(tempdir, 'require.cjs');
	writeFileSync(script2, `${tester.toString()} require(${spec});tester(require(${spec}));`);
	writeFileSync(
		resolve(tempdir, 'package.json'),
		JSON.stringify(
			{
				name: 'import-test',
				type: 'module',
				dependencies: {
					[pkgName]: '*',
				},
			},
			null,
			4,
		),
	);

	const slink = resolve(tempdir, 'node_modules', pkgName);
	mkdirSync(dirname(slink), { recursive: true });
	symlinkSync(projectRoot, slink, 'dir');

	const pnt1 = checkNode('import', script1, tempdir, logger);
	const pnt2 = checkNode('require', script2, tempdir, logger);

	const tsCompileOption: ts.CompilerOptions = {
		lib: ['DOM', 'ESNext'],
		typeRoots: [resolve(slink, 'node_modules'), resolve(slink, 'node_modules/@types')],
		types: [],
	};
	if (dependencies?.['@types/node'] || devDependencies?.['@types/node']) {
		tsCompileOption.types!.push('node');
	}

	const pct1 = checkTs(resolve(tempdir, 'node-16-esm'), pkgName, {
		moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.NodeNext],
		resolvePackageJsonImports: true,
		resolvePackageJsonExports: true,
		module: ts.ModuleKind[ts.ModuleKind.NodeNext],
		...tsCompileOption,
	}).then(
		() => logger.verbose(`test node16 (esm) loader: ok`),
		(e) => 'node16 (esm) resolution failed: ' + e?.message,
	);

	const pct2 = checkTs(resolve(tempdir, 'node-16-cjs'), pkgName, {
		moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.NodeNext],
		resolvePackageJsonImports: true,
		resolvePackageJsonExports: true,
		module: ts.ModuleKind[ts.ModuleKind.CommonJS],
		...tsCompileOption,
	}).then(
		() => logger.verbose(`test node16 (cjs) loader: ok`),
		(e) => 'node16 (cjs) resolution failed: ' + e?.message,
	);

	const pct3 = checkTs(resolve(tempdir, 'node'), pkgName, {
		moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.Node10],
		module: ts.ModuleKind[ts.ModuleKind.ESNext],
		...tsCompileOption,
	}).then(
		() => logger.verbose(`test node10 module loader: ok`),
		(e) => 'node10 module resolution failed: ' + e?.message,
	);

	return [pnt1, pnt2, pct1, pct2, pct3];
}

async function requireExeca(): Promise<typeof import('execa')> {
	return eval('import("execa")');
}

async function checkNode(title: string, src: string, tempdir: string, logger: IOutputShim): Promise<string | void> {
	const execa = (await requireExeca()).execa;
	const r = await execa(process.execPath, [src], {
		stderr: 'pipe',
		stdout: 'pipe',
		stdin: 'ignore',
		all: true,
		encoding: 'utf8',
		shell: true,
		cwd: tempdir,
	});
	let output = r.all!.trim();
	if (r.exitCode !== 0 || !output.endsWith('}')) {
		logger.verbose('try %s - fail', title);
		return `<${title}> test failed: ${r.stderr}`;
	}
	if (output.startsWith(signal)) {
		output = output.slice(signal.length);
	} else {
		const pos = output.lastIndexOf(signal);
		logger.warn('%s has unexpect output: %s', title, output.slice(0, pos).trim());
		output = output.slice(pos + 1);
	}
	if (r.stderr.trim()) {
		logger.warn('%s has unexpect stderr output: %s', title, r.stderr);
	}

	const data = JSON.parse(output);
	const oDef = `default=${data.hasDefault ? 'yes' : 'no'}`;
	let oSymSz = `symbols=${data.symbolList.length} [`;
	oSymSz += data.symbolList.slice(0, 5).join(', ');
	if (data.symbolList.length > 5) {
		oSymSz += ', ...';
	}
	oSymSz += ']';

	logger.verbose('try %s - ok\n\t%s, %s', title, oDef, oSymSz);
}

async function checkTs(
	path: string,
	pkgName: string,
	options: Record<keyof ts.CompilerOptions, any>,
): Promise<string | void> {
	await mkdir(path);
	await writeFile(resolve(path, 'index.ts'), `import * as __lib from '${pkgName}';`);
	await writeFile(
		resolve(path, 'tsconfig.json'),
		JSON.stringify(
			{
				compilerOptions: {
					strict: true,
					noEmit: true,
					...options,
				},
				files: ['index.ts'],
			},
			null,
			4,
		),
	);

	const execa = (await requireExeca()).execa;
	const r = execa('tsc', ['-p', path], { stderr: 'pipe', stdin: 'ignore', encoding: 'utf8' });

	if (r.exitCode !== 0) return 'failed compile: ' + r.stderr;
}
