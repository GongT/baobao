import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';

export function run(p: string) {
	const path = p.endsWith('package.json') ? resolve(process.cwd(), p) : resolve(process.cwd(), p, 'package.json');
	if (!existsSync(path)) {
		return 'missing package.json';
	}

	const {
		name: pkgName,
		main: pkgMain,
		module: pkgModule,
		exports: pkgExports,
		types,
	} = JSON.parse(readFileSync(path, 'utf-8'));

	if (pkgMain === undefined && pkgModule === undefined) {
		if (pkgExports === undefined) {
			return undefined;
		}
	}

	if (types) {
		console.log('test file:', types);
		const dts = resolve(path, '..', types);
		if (existsSync(dts)) {
			console.log('  - ok');
		} else {
			console.log('  - fail');
			return `missing .d.ts file`;
		}
	}

	const TMP = mkdtempSync(tmpdir() + '/');
	process.on('beforeExit', () => {
		rmSync(TMP, { recursive: true });
	});

	const script1 = resolve(TMP, 'import.js');
	writeFileSync(script1, `import ${JSON.stringify(pkgName)}; console.log('ok')`);
	const script2 = resolve(TMP, 'require.cjs');
	writeFileSync(script2, `require(${JSON.stringify(pkgName)}); console.log('ok')`);
	writeFileSync(
		resolve(TMP, 'package.json'),
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

	const slink = resolve(TMP, 'node_modules', pkgName);
	mkdirSync(dirname(slink), { recursive: true });
	symlinkSync(dirname(path), slink, 'dir');

	for (const [src, title] of [
		[script1, 'import'],
		[script2, 'require'],
	] as const) {
		console.log('try %s:', title);
		const r = spawnSync(process.execPath, [src], {
			stdio: ['ignore', 'pipe', 'pipe'],
			shell: true,
			encoding: 'utf8',
			cwd: TMP,
		});
		if (r.status !== 0 || !r.stdout.trim().endsWith('ok')) {
			console.log('  - fail');
			return `${title} test failed: ${r.stderr}`;
		}
		console.log('  - ok');
	}
	return undefined;
}
