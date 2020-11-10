import { context, filesystem, logger } from '@gongt/vscode-helpers';
import { promiseBool } from '@idlebox/common';
import { checkChildProcessResult } from '@idlebox/node';
import { spawn } from 'child_process';
import commandExistsAsync from 'command-exists';
import { access as accessAsync, constants, mkdir as mkdirAsync, stat as statAsync } from 'fs';
import { createRequire } from 'module';
import { platform, tmpdir } from 'os';
import { resolve } from 'path';
import { inspect, promisify } from 'util';
import { env, ExtensionKind, extensions } from 'vscode';
import sqlite3 from 'vscode-sqlite3';

const commandExists = promisify(commandExistsAsync);
const access = promisify(accessAsync);
const mkdir = promisify(mkdirAsync);
const stat = promisify(statAsync);
// const readFile = promisify(readFileAsync);
// const writeFile = promisify(writeFileAsync);

interface ICallback<T> {
	(client: sqlite3.Database): T;
}

const moduleName = 'vscode-sqlite3';

export type GetFnType = (
	sql: string,
	params: any,
	callback?: (this: sqlite3.Statement, err: Error | null, row: any) => void
) => any;

export async function withDatabase<T>(dbPath: string, callback: ICallback<T | Promise<T>>): Promise<T> {
	let sqlite: typeof sqlite3;
	if (extensions.getExtension(context.extensionId)!.extensionKind === ExtensionKind.UI) {
		logger.info('load VSCode bundled version.');
		sqlite = await loadBundled(moduleName);
	} else if (platform() === 'linux' || platform() === 'darwin') {
		logger.info('download library by package manager.');
		sqlite = await downloadAndBuild(moduleName);
	} else {
		logger.error('platformt not supported.');
		throw new Error(`native modules do not support your environment: platform=${platform()}, remote=true`);
	}

	const Database = sqlite.verbose().Database;

	logger.info('Open database: %s', dbPath);
	const client = new Database(dbPath, sqlite.OPEN_READWRITE);
	return Promise.resolve()
		.then(() => callback(client))
		.finally(() => {
			logger.info('Close database.');
			return new Promise((resolve, reject) => {
				client.close((e) => {
					if (e) {
						reject(e);
					} else {
						resolve();
					}
				});
			});
		});
}

async function loadBundled(moduleName: string) {
	const appRoot = env.appRoot;
	const pkgPath = resolve(appRoot, 'package.json');
	const require = createRequire(pkgPath);

	try {
		return require(moduleName);
	} catch (e) {
		logger.error('Can not require() VSCode bundled module: %s', e.stack || e.message);
		throw e;
	}
}

async function downloadAndBuild(moduleName: string) {
	const store = await getSystemStore();

	const pkgPath = resolve(store, 'package.json');
	const require = createRequire(pkgPath);
	try {
		const ret = require(moduleName);
		logger.info('Require success!');
		return ret;
	} catch (e) {
		if (e.code !== 'MODULE_NOT_FOUND') {
			logger.error('Can not require() module: %s', e.stack || e.message);
			throw e;
		}
		logger.info('module not in cache');
	}

	const { manager, install } = await getPackageManager();

	logger.info('Install start...');

	const p = spawn(manager, [install, '--unsafe-perm', moduleName], {
		stdio: ['ignore', 'pipe', 'pipe'],
		cwd: store,
		env: {
			...process.env,
			NODE_ENV: 'production',
		},
	});
	Object.assign(p, { command: `${manager} ${install} --unsafe-perm ${moduleName}` });

	await new Promise((resolve) => {
		p.on('exit', resolve);
		p.on('error', (error) => {
			Object.assign(p, { error });
			resolve();
		});
	});

	logger.info('Install exited...');
	logger.debug(inspect(p));

	checkChildProcessResult(p);

	try {
		return require(moduleName);
	} catch (e) {
		logger.error('Can not require() module: %s', e.stack || e.message);
		throw e;
	}
}

async function getPackageManager() {
	for (const [manager, install] of [
		['pnpm', 'install'],
		['yarn', 'add'],
		['npm', 'install'],
	]) {
		if (await commandExists(manager)) {
			logger.info('  - using package manager: ' + manager);
			return { manager, install };
		}
	}
	throw new Error('can not find npm from PATH');
}

async function getSystemStore(): Promise<string> {
	const moduleDir = filesystem.privateFileGlobal('../../native_modules');
	const hasPerm = promiseBool(moduleDir.resolve('try-perm.txt').writeText('ok:' + Date.now()));
	if (hasPerm) {
		logger.info('  - using plugin parent folder');
		return moduleDir.path.fsPath;
	}
	logger.warn('VSCode data folder (where extensions/ folder exists, normally ~/.vscode) is not writable');

	const HOME = process.env.HOME || process.env.USERPROFILE;
	if (HOME) {
		const share = HOME + '/.local/share';
		if (await promiseBool(access(share, constants.W_OK))) {
			logger.info('  - using HOME/.local/share');
			const dir = resolve(share, 'native_modules');
			if (!promiseBool(stat(dir))) {
				await mkdir(dir);
			}
			return dir;
		}
	}

	logger.warn('  - using system temp folder');
	const dir = resolve(tmpdir(), 'native_modules');
	if (!promiseBool(stat(dir))) {
		await mkdir(dir);
	}
	return dir;
}
