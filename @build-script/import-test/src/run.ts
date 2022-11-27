import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { dirname, resolve } from 'path';

export function run(p: string) {
	const path = p.endsWith('package.json') ? resolve(process.cwd(), p) : resolve(process.cwd(), p, 'package.json');
	if (!existsSync(path)) {
		console.error('missing package.json');
		process.exit(1);
	}

	const pkgName = JSON.parse(readFileSync(path, 'utf-8')).name;

	console.log('try import:');
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
		const r = spawnSync(process.execPath, [src], {
			stdio: ['inherit', 'pipe', 'inherit'],
			shell: true,
			encoding: 'utf8',
			cwd: TMP,
		});
		if (r.status !== 0 || !r.stdout.trim().endsWith('ok')) {
			console.error('\x1B[48;5;9m\x1B[K⚠️  %s test failed: %s\x1B[0m', title, path);
			process.exit(1);
		}

		if (process.stdout.isTTY) {
			console.log('\x1B[48;5;10m\x1B[K✅  %s test success: %s\x1B[0m', title, path);
		}
	}
}
