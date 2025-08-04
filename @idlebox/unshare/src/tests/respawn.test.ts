import { prettyPrintError } from '@idlebox/common';
import { findUpUntilSync } from '@idlebox/node';
import assert from 'node:assert';
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { unshareReadonlyFileSystem } from '../features/respawn.js';

console.log('before pid = %s', process.pid); // print "a not 1 number" and "1"

const nf = resolve(import.meta.dirname, 'not-exists');
const outputDir = resolve(import.meta.dirname, 'output');
mkdirSync(outputDir, { recursive: true });

const outputDir2 = resolve(import.meta.dirname, 'tmpfs');
mkdirSync(outputDir2, { recursive: true });

const rootFile = findUpUntilSync({ from: import.meta.dirname, file: 'package.json' });
if (!rootFile) throw new Error('missing package.json');
const root = dirname(rootFile);

unshareReadonlyFileSystem({ pid: true, tmpfs: [outputDir2], volatile: [root], writable: [nf, outputDir] });

try {
	assert.equal(process.pid, 1, 'process.pid should be 1 after unshareReadonlyFileSystem');
	console.log(readdirSync('/tmp'));
	assert.equal(readdirSync('/tmp').length, 1, '/tmp mount failed'); // should have overlay folder
	writeFileSync(resolve(outputDir, 'test.txt'), 'Hello World');
	writeFileSync(resolve(outputDir2, 'test.txt'), 'Not Exists');
	writeFileSync(resolve(root, 'test.txt'), 'Not Exists');
} catch (e: any) {
	prettyPrintError('测试失败', e);
	process.exitCode = 123;
}

try {
	writeFileSync(resolve(root, '../.test.txt'), 'wont ok');
	assert.fail('should not write file to parent directory');
} catch (e) {
	// correct
}
