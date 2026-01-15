import { prettyPrintError } from '@idlebox/common';
import { findUpUntilSync } from '@idlebox/node';
import assert, { AssertionError } from 'node:assert';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { unshareReadonlyFileSystem } from '../features/respawn.js';
import { FsNodeType } from '../features/types.js';

console.log('before pid = %s', process.pid); // print "a not 1 number" and "1"

const outputDir = resolve(import.meta.dirname, 'output');
mkdirSync(outputDir, { recursive: true });

const outputDir2 = resolve(import.meta.dirname, 'tmpfs');
mkdirSync(outputDir2, { recursive: true });

const rootFile = findUpUntilSync({ from: import.meta.dirname, file: 'package.json' });
if (!rootFile) throw new Error('missing package.json');
const pkgRoot = dirname(rootFile);

const repoRootFile = findUpUntilSync({ from: pkgRoot, file: 'pnpm-workspace.yaml' });
if (!repoRootFile) throw new Error('missing pnpm-workspace.yaml');
const repoRoot = dirname(repoRootFile);

unshareReadonlyFileSystem('xxxx-yyyy-zzz', {
	verbose: true,
	pid: true,
	volumes: [
		{ path: repoRoot, type: FsNodeType.readonly },
		{ path: pkgRoot, type: FsNodeType.volatile },
		{ path: outputDir2, type: FsNodeType.tmpfs },
		{ path: outputDir, type: FsNodeType.passthru },
	],
});

try {
	assert.equal(process.pid, 1, 'process.pid should be 1 after unshareReadonlyFileSystem');
	console.log(readdirSync('/tmp'));
	assert.equal(readdirSync('/tmp').length, 0, '/tmp mount failed'); // should have overlay folder
	writeFileSync(resolve(outputDir, 'test.txt'), 'Hello World');
	writeFileSync(resolve(outputDir2, 'test.txt'), 'Not Exists');
	writeFileSync(resolve(pkgRoot, 'test.txt'), 'Not Exists');
} catch (e: any) {
	if (e instanceof AssertionError) {
		console.log({ ...e });
	}
	prettyPrintError('测试失败', e);
	process.exitCode = 123;
}

try {
	writeFileSync(resolve(pkgRoot, '../.test.txt'), 'wont ok');
	assert.fail('should not write file to parent directory');
} catch {
	// correct
}
