import { createArgsReader } from '@idlebox/args';
import { createRootLogger, logger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { channelClient, listenOnStream } from '@mpis/client';
import { execaNode } from 'execa';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import split2 from 'split2';
import { loadConfig, loadFile } from './common/config.js';
import { packageJsonValidNames } from './common/types.js';

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
const wd = process.cwd();

const argv = createArgsReader(process.argv.slice(2));
const buildArg = argv.single(['--build', '-b']);
const projectArg = argv.single(['--project', '-p']);

if (buildArg && projectArg) {
	await import(tscPath);
	process.exit(process.exitCode ?? 0);
	// throw new Error('Cannot specify both --build and --project. Please choose one.');
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
const packageFile = findUpUntilSync({ from: projAbs, file: [...packageJsonValidNames] });
if (!packageFile) throw new Error(`Could not find package.json in the project directory: ${projAbs}`);

if (!config) config = await loadConfig(wd, logger);

const packageJson = await loadFile(packageFile);
const title = packageJson.name?.replace('@', '').replace('/', ':') ?? 'no name package';

channelClient.start();
const tscBluePrint = /^(\s*)\x1B\[96m/;
const lookLikePath = /^(.+\.tsx?)(:\d+:\d+)/i;

// TODO: 似乎没起作用
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
const explicitPreserve = argv.flag(['--preserveWatchOutput']) > 0;
const verboseLevel = argv.flag(['--debug', '-d']);

const tscArgs = argv.unused();
if (buildArg) {
	tscArgs.unshift('--build', buildArg);
} else if (projectArg) {
	tscArgs.unshift('--project', projectArg);
} else if (project) {
	const borp = config?.build ? '--build' : '--project';
	tscArgs.unshift(borp, project);
}

if (!process.stderr.isTTY) {
	logger.debug`输出不是TTY，启用 --preserveWatchOutput 以保持输出完整性`;
	tscArgs.push('--preserveWatchOutput');
} else if (explicitPreserve) {
	logger.debug`命令行启用 --preserveWatchOutput`;
	tscArgs.push('--preserveWatchOutput');
} else if (verboseLevel > 0) {
	logger.debug`调试模式，启用 --preserveWatchOutput`;
	tscArgs.push('--preserveWatchOutput');
}

logger.verbose`加载真正的tsc: long<${tscPath}> commandline<${tscArgs}>`;

const cp = execaNode({
	stdin: 'ignore',
	stdout: 'pipe',
	stderr: 'inherit',
	all: false,
	encoding: 'utf8',
	reject: false,
	buffer: false,
})`${tscPath} ${tscArgs}`;

const splitStream = split2((line) => {
	const nline = replaceLine(line);
	// biome-ignore lint/style/useTemplate: nl
	return nline + '\n';
});

cp.stdout.pipe(splitStream, { end: true });
if (logger.verbose.isEnabled) {
	splitStream.on('data', (line) => {
		logger.verbose`tsc: ${line.trim()}`;
	});
}

listenOnStream(splitStream, {
	title: `tsc:${title}`,
	start: matchStartLine,
	stop: matchEndingLine,
	isFailed(stop_line) {
		return !stop_line.includes('Found 0 errors');
	},
});

await cp;
