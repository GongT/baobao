import { createArgsReader } from '@idlebox/args';
import { createRootLogger, logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { channelClient, hookCurrentProcessOutput, listenOnStream } from '@mpis/client';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import split2 from 'split2';
import { loadConfig } from './common/config.js';

createRootLogger('mpis:tsc');

const tsPkgJsonPath = fileURLToPath(import.meta.resolve('typescript/package.json'));
const tsPkgJson = JSON.parse(readFileSync(tsPkgJsonPath, 'utf-8'));

const binPath = tsPkgJson.bin?.tsc;
if (!binPath) {
	throw new Error('TypeScript package does not have a "bin" entry for "tsc".');
}

// [9:51:48 AM] Found 123 errors. Watching for file changes.
const matchEndingLine = /Found (\d+) errors?/m;
// [9:51:48 AM] Starting compilation in watch mode
// [9:51:48 AM] File change detected. Starting incremental compilation...
const matchStartLine = /(File change detected|Starting compilation in watch mode)/m;

const tscPath = resolve(tsPkgJsonPath, '..', binPath);
const args = process.argv.splice(1, Infinity, tscPath).slice(1);
const wd = process.cwd();

const argv = createArgsReader(args);
const buildArg = argv.single(['--build', '-b']);
const projectArg = argv.single(['--project', '-p']);

if (buildArg && projectArg) {
	await import(tscPath); // 实际不会返回
	throw new Error('Cannot specify both --build and --project. Please choose one.');
}

let project = buildArg || projectArg;
let config;
if (!project) {
	config = await loadConfig(wd, logger);
	if (config?.project) {
		project = config.project;
		logger.debug`Using project from config: ${project}`;
	} else {
		await import(tscPath); // 实际不会返回
		throw new Error('No project specified. Use --build or --project to specify a TypeScript project.');
	}
}

const projAbs = resolve(wd, project);
const packageFile = findUpUntilSync({ from: projAbs, file: 'package.json' });
if (!packageFile) throw new Error(`Could not find package.json in the project directory: ${projAbs}`);

if (!config) config = await loadConfig(wd, logger);

// console.error('Using TypeScript compiler:', tscPath);
// console.error('packageFile=', packageFile);

const { default: packageJson } = await import(packageFile, { with: { type: 'json' } });
const title = packageJson.name.replace('@', '').replace('/', ':');

channelClient.start();
const tscBluePrint = /^(\s*)\x1B\[96m/;
const lookLikePath = /^(.+\.tsx?)(:\d+:\d+)/i;

hookCurrentProcessOutput({
	injection(kind) {
		if (kind === 'stderr') {
			return undefined;
		}

		const splitStream = split2((line) => {
			const nline = replaceLine(line);
			// biome-ignore lint/style/useTemplate: nl
			return nline + '\n';
		});

		listenOnStream(splitStream, {
			title: `tsc:${title}`,
			start: matchStartLine,
			stop: matchEndingLine,
			isFailed(stop_line) {
				return !stop_line.includes('Found 0 errors');
			},
		});

		return splitStream;
	},
});

function replaceLine(line: string) {
	if (!line) return line;

	if (tscBluePrint.test(line)) {
		return replaceColorLine(line);
	} else if (lookLikePath.test(line)) {
		return replaceMonoLine(line);
	}
	return line;
}

function replaceColorLine(line: string) {
	const match = tscBluePrint.exec(line);
	if (!match) return line;

	const beforeEnding = line.indexOf('\x1B', match[0].length) - 1;
	if (beforeEnding < 0) return line;

	const rest = line.slice(beforeEnding);

	let filePath = line.slice(match[0].length, beforeEnding);
	filePath = resolve(wd, filePath);

	return `${match[0]}${filePath}${rest}`;
}

function replaceMonoLine(line: string) {
	const replaced = line.replace(lookLikePath, (_match, file, rowcol) => {
		const absPath = resolve(wd, file);
		return `${absPath}${rowcol}`;
	});

	return replaced;
}

// console.log('output hooked');
argv.flag(['--preserveWatchOutput']);

const rebuild = argv.unused();
if (buildArg) {
	rebuild.unshift('--build', buildArg);
} else if (projectArg) {
	rebuild.unshift('--project', projectArg);
} else if (project) {
	const borp = config?.build ? '--build' : '--project';
	rebuild.unshift(borp, project);
}

process.argv.push(...rebuild);
process.argv.push('--preserveWatchOutput');

logger.verbose`commandline<${process.argv}>`;

await import(tscPath);
