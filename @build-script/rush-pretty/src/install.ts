import { loadJsonFile, loadJsonFileIfExists, writeJsonFileBack } from '@idlebox/json-edit';
import { execa } from 'execa';
import { access, chmod, constants, mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { githook, prettierignore, prettierrc } from './data.js';

console.log('install prettier to current rush project.');

const COMMAND_NAME = 'prettier';
const target = resolve(process.cwd());

interface ICommand {
	commandKind: string;
	name: string;
	summary: string;
	autoinstallerName: string;
	safeForSimultaneousRushProcesses: boolean;
	shellCommand: string;
}
interface IParameter {
	parameterKind: string;
	longName: string;
	shortName: string;
	description: string;
	associatedCommands: string[];
	argumentName: string;
	required: boolean;
}

function applyObject<T>(array: Array<T>, field: string, value: string, create: Partial<T>, update: Partial<T>): T {
	let ele: T = array.find((e) => e[field] === value);
	if (!ele) {
		ele = { [field]: value, ...create, ...update } as T;
		array.push(ele);
	} else {
		Object.assign(ele, update);
	}
	return ele;
}
function die(msg: string, ...v: any[]) {
	console.error(msg, ...v);
	process.exit(1);
}
function ensureInSet(set: string[], value: string) {
	if (!Array.isArray(set)) {
		die('invalid config file, please check.');
	}
	if (!set.includes(value)) {
		set.push(value);
	}
}

console.log('=== update command-line.json');
const cmdFile = resolve(target, 'common/config/rush/command-line.json');
console.log('absolute path:', cmdFile);

try {
	await stat(cmdFile);
	await access(cmdFile, constants.R_OK | constants.W_OK);
} catch (e: any) {
	die('failed touch file: %s', (e as Error).message);
}

const cmdJson = await loadJsonFile(cmdFile);
if (!cmdJson.commands) {
	cmdJson.commands = [];
}
applyObject<ICommand>(
	cmdJson.commands,
	'name',
	COMMAND_NAME,
	{ summary: 'run prettier to format all files' },
	{
		commandKind: 'global',
		autoinstallerName: 'rush-prettier',
		safeForSimultaneousRushProcesses: true,
		shellCommand: 'rush-pretty',
	}
);

if (!cmdJson.parameters) {
	cmdJson.parameters = [];
}
const verbose = applyObject<IParameter>(
	cmdJson.parameters,
	'longName',
	'--verbose',
	{ description: 'show verbose output', associatedCommands: [] },
	{
		parameterKind: 'flag',
	}
);
ensureInSet(verbose.associatedCommands, COMMAND_NAME);

const all = applyObject<IParameter>(
	cmdJson.parameters,
	'longName',
	'--all',
	{ description: 'apply to all files', associatedCommands: [] },
	{
		parameterKind: 'flag',
	}
);
ensureInSet(all.associatedCommands, COMMAND_NAME);

const staged = applyObject<IParameter>(
	cmdJson.parameters,
	'longName',
	'--staged',
	{ description: 'apply to git staged files (also including not added ones)', associatedCommands: [] },
	{
		parameterKind: 'flag',
	}
);
ensureInSet(staged.associatedCommands, COMMAND_NAME);

console.log('write file.');
const ch = await writeJsonFileBack(cmdJson);
if (!ch) {
	console.log('unchanged.');
}

async function create_example(file: string, content: string) {
	try {
		await stat(file);
		console.log('%s exists', file);
		return;
	} catch {}
	console.log('create example `%s` file', file);
	if (file.includes('/')) {
		await mkdir(dirname(file), { recursive: true });
	}
	await writeFile(file, content);
}

console.log('=== creating prettier config files');
await create_example('.prettierrc.js', prettierrc);
await create_example('.prettierignore', prettierignore);

console.log('=== creating git hook');
const hookFile = resolve(target, 'common/git-hooks/pre-commit');
console.log('absolute: %s', hookFile);
try {
	await stat(hookFile);
	console.log('hook file already exists.');

	const data = await readFile(hookFile, 'utf-8');
	if (!data.includes(`${COMMAND_NAME} --staged`)) {
		console.log(`\x1B[38;5;11m
===========================================
You need add this line manually: (in ${hookFile})

	node common/scripts/install-run-rush.js ${COMMAND_NAME} --staged

===========================================\x1B[0m`);
	}
} catch {
	await writeFile(hookFile, githook.replace('COMMAND_NAME', COMMAND_NAME));
} finally {
	await chmod(hookFile, 0o755);
}

console.log('=== creating autoinstaller');
const aiPkg = await loadJsonFileIfExists(resolve(target, 'common/autoinstallers/rush-prettier/package.json'));
Object.assign(aiPkg, {
	name: 'rush-prettier',
	version: '1.0.0',
	private: true,
	dependencies: {
		'@build-script/rush-pretty': 'latest',
	},
});
await writeJsonFileBack(aiPkg);
await execa('rush', ['update-autoinstaller', '--name', 'rush-prettier'], { stdio: 'inherit' });
