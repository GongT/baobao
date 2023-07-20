import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';
import { IPackageJson } from '@rushstack/node-core-library';
import { execaSync } from 'execa';
import ts from 'typescript';
import { IOutputShim } from '../../misc/scopedLogger';

const signal = '\x00';

function tester(exports: any) {
	const signal = '\x00'; // for stringify
	const imports = exports?.default ?? exports;
	const info = {
		hasDefault: Object.hasOwn(exports, 'default'),
		symbolList: Object.keys(imports),
	};
	process.stdout.write('\n\n\n' + signal + JSON.stringify(info));
	process.exit(0);
}

export function run(projectInput: string, logger: IOutputShim, tempdir: string = tmpdir()): string {
	const pkgJsonPath = projectInput.endsWith('package.json')
		? resolve(process.cwd(), projectInput)
		: resolve(process.cwd(), projectInput, 'package.json');

	if (!existsSync(pkgJsonPath)) return `missing package.json`;

	const tempdirPrivate = resolve(tempdir, 'tmp.' + (Math.random() * 65535).toFixed(0));
	const projectRoot = dirname(pkgJsonPath);

	try {
		const pkgJson = JSON.parse(readFileSync(pkgJsonPath, 'utf-8'));
		const errorMessage = runInner(projectRoot, pkgJson, logger, tempdirPrivate);
		if (!errorMessage) return '';

		return errorMessage.replaceAll(tempdirPrivate, projectRoot).replace(`/node_modules/${pkgJson.name}`, '');
	} catch (e: any) {
		logger.warn(e.stack);
		return 'error during test';
	}
}

function runInner(
	projectRoot: string,
	pkgJson: IPackageJson & Record<string, any>,
	logger: IOutputShim,
	tempdir: string
) {
	const {
		name: pkgName,
		main: pkgMain,
		module: pkgModule,
		exports: pkgExports,
		types: pkgTypes,
		dependencies,
		devDependencies,
	} = pkgJson;
	const innerTypes = pkgExports?.['.']?.['types'];

	for (const types of [innerTypes, pkgTypes]) {
		if (typeof types !== 'string') continue;

		logger.debug('test file: ' + types);
		const dts = resolve(projectRoot, types);
		if (existsSync(dts)) {
			logger.debug('  - exists.\n');
		} else {
			logger.debug('  - file not found\n');
			return `missing .d.ts file (should at ${dts})`;
		}
	}

	if (pkgMain === undefined && pkgModule === undefined) {
		if (!pkgExports) {
			logger.debug('no "exports" or "main" in package.json\n');
			return undefined;
		}
		if (typeof pkgExports === 'object' && !pkgExports['.']) {
			logger.warn('no default exports in package.json, current not support\n');
			return undefined;
		}
	}

	if (!existsSync(tempdir)) mkdirSync(tempdir, { recursive: true });
	logger.debug(`using temp dir: ${tempdir}\n`);
	process.on('exit', () => {
		if (process.env['NO_DELETE_TEMP']) {
			logger.log(`not deleting temp dir: ${tempdir} (reason: NO_DELETE_TEMP)\n`);
		} else {
			logger.debug(`deleting temp dir: ${tempdir} (set $env:NO_DELETE_TEMP=yes to skip)\n`);
			rmSync(tempdir, { recursive: true });
		}
	});

	const spec = JSON.stringify(pkgName);

	const script1 = resolve(tempdir, 'import.js');
	writeFileSync(script1, `${tester.toString()}\nimport ${spec}\nimport * as items from ${spec};tester(items);`);
	const script2 = resolve(tempdir, 'require.cjs');
	writeFileSync(script2, `${tester.toString()}\n require(${spec});\ntester(require(${spec}));`);
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
			4
		)
	);

	const slink = resolve(tempdir, 'node_modules', pkgName);
	mkdirSync(dirname(slink), { recursive: true });
	symlinkSync(projectRoot, slink, 'dir');

	for (const [src, title] of [
		[script1, 'import'],
		[script2, 'require'],
	] as const) {
		logger.debug('try ' + title + ':');
		const r = spawnSync(process.execPath, [src], {
			stdio: ['ignore', 'pipe', 'pipe'],
			shell: true,
			encoding: 'utf8',
			cwd: tempdir,
		});
		let output = r.stdout.trim();
		if (r.status !== 0 || !output.endsWith('}')) {
			logger.debug('  - fail\n');
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

		logger.debug(`  - ok\n`);
		logger.log(`  ${oDef}, ${oSymSz}`);
	}

	const tsCompileOption: ts.CompilerOptions = {
		lib: ['DOM', 'ESNext'],
		typeRoots: [resolve(slink, 'node_modules'), resolve(slink, 'node_modules/@types')],
		types: [],
	};
	if (dependencies?.['@types/node'] || devDependencies?.['@types/node']) {
		tsCompileOption.types!.push('node');
	}

	try {
		logger.debug('test node16 (esm) loader:');
		checkTs(resolve(tempdir, 'node-16-esm'), pkgName, {
			moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.NodeNext],
			resolvePackageJsonImports: true,
			resolvePackageJsonExports: true,
			module: ts.ModuleKind[ts.ModuleKind.NodeNext],
			...tsCompileOption,
		});
		logger.debug(`  - ok\n`);
	} catch (e: any) {
		return 'node16 (esm) resolution failed: ' + e?.message;
	}

	try {
		logger.debug('test node16 (cjs) loader:');
		checkTs(resolve(tempdir, 'node-16-cjs'), pkgName, {
			moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.NodeNext],
			resolvePackageJsonImports: true,
			resolvePackageJsonExports: true,
			module: ts.ModuleKind[ts.ModuleKind.CommonJS],
			...tsCompileOption,
		});
		logger.debug(`  - ok\n`);
	} catch (e: any) {
		return 'node16 (cjs) resolution failed: ' + e?.message;
	}

	try {
		logger.debug('test node module loader:');
		checkTs(resolve(tempdir, 'node'), pkgName, {
			moduleResolution: ts.ModuleResolutionKind[ts.ModuleResolutionKind.Node10],
			module: ts.ModuleKind[ts.ModuleKind.ESNext],
			...tsCompileOption,
		});
		logger.debug(`  - ok\n`);
	} catch (e: any) {
		return 'node module resolution failed: ' + e?.message;
	}

	return undefined;
}

function checkTs(path: string, pkgName: string, options: Record<keyof ts.CompilerOptions, any>) {
	mkdirSync(path);
	writeFileSync(resolve(path, 'index.ts'), `import * as __lib from '${pkgName}';`);
	writeFileSync(
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
			4
		)
	);

	const r = execaSync('tsc', ['-p', path], { stderr: 'pipe', stdin: 'ignore', encoding: 'utf8' });

	if (r.exitCode !== 0) throw new Error('failed compile: ' + r.stderr);
}
