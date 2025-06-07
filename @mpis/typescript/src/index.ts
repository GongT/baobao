import { createArgsReader } from '@idlebox/args';
import { findUpUntilSync } from '@idlebox/node';
import { channelClient, hookCurrentProcessOutput } from '@mpis/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const tsPkgJsonPath = fileURLToPath(import.meta.resolve('typescript/package.json'));
const tsPkgJson = JSON.parse(readFileSync(tsPkgJsonPath, 'utf-8'));

const binPath = tsPkgJson.bin?.tsc;
if (!binPath) {
	throw new Error('TypeScript package does not have a "bin" entry for "tsc".');
}

// [9:51:48 AM] Found 123 errors. Watching for file changes.
const matchEndingLine = /^\[.+\] Found (\d+) errors?/m;
// [9:51:48 AM] Starting compilation in watch mode
// [9:51:48 AM] File change detected. Starting incremental compilation...
const matchStartLine = /^\[.+\] (File change detected|Starting compilation in watch mode)/m;

const tscPath = resolve(tsPkgJsonPath, '..', binPath);
const args = process.argv.splice(1, Infinity, tscPath).slice(1);

const argv = createArgsReader(args);
const buildArg = argv.single(['--build', '-b']);
const projectArg = argv.single(['--project', '-p']);
const project = buildArg || projectArg;
if (!project) {
	await import(tscPath); // 实际不会返回
	throw new Error('No project specified. Use --build or --project to specify a TypeScript project.');
}

const projAbs = resolve(process.cwd(), project);
const packageFile = findUpUntilSync({ from: projAbs, file: 'package.json' });
if (!packageFile) throw new Error(`Could not find package.json in the project directory: ${projAbs}`);

// console.log('Using TypeScript compiler:', tscPath);
// console.log('packageFile=', packageFile);

const { default: packageJson } = await import(packageFile, { with: { type: 'json' } });
const title = packageJson.name.replace('@', '').replace('/', ':');

channelClient.start();
hookCurrentProcessOutput({
	title: `tsc:${title}`,
	start: matchStartLine,
	stop: matchEndingLine,
	isFailed(stop_line) {
		return !stop_line.includes('Found 0 errors');
	},
});

// console.log('output hooked');

const rebuild = argv.unused();
if (buildArg) rebuild.push('--build', buildArg);
if (projectArg) rebuild.push('--project', projectArg);
process.argv.push(...rebuild);

// console.log(`+ ${process.argv.join(' ')}`);

await import(tscPath);

throw new Error('TypeScript compiler should not return.');
