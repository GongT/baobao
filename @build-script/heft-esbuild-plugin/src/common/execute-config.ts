import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';
import { parse } from 'comment-json';
import type { BuildOptions } from 'esbuild';
import { readFile } from 'node:fs/promises';
import type { IOutputModifier } from './type.js';

interface IUserInput {
	readonly options: BuildOptions | BuildOptions[];
	onEmit?: IOutputModifier;
}

export interface IProcessLibrary {
	readonly options: BuildOptions[];
	readonly onEmit?: IOutputModifier;
}

export async function executeConfigFile(
	configFile: string,
	session: IHeftTaskSession,
	configuration: HeftConfiguration
): Promise<IProcessLibrary> {
	session.logger.terminal.writeDebugLine(`(re-)load config file: ${configFile}`);

	try {
		const userlib = await loadRaw(configFile, session, configuration);
		if (typeof userlib !== 'object') throw new Error(`invalid config file: ${configFile}`);
		if (typeof userlib.options !== 'object') throw new Error(`missing options config file: ${configFile}`);

		const options = Array.isArray(userlib.options) ? userlib.options : [userlib.options];

		return {
			options,
			onEmit: userlib.onEmit,
		};
	} catch (e: any) {
		session.logger.terminal.writeWarningLine('failed load esbuild config file (', configFile, ')');
		if (e.constructor.name === 'TSError') {
			const ee = new Error(e.message);
			ee.stack = ee.message;
			throw ee;
		}
		throw e;
	}
}

let tsnodeinited = false;
async function registerTsNode(session: IHeftTaskSession, configuration: HeftConfiguration) {
	if (!tsnodeinited) {
		session.logger.terminal.writeDebug('loading ts-node: ');
		const tsnodePath = await configuration.rigPackageResolver.resolvePackageAsync('ts-node', session.logger.terminal);
		session.logger.terminal.writeDebugLine('resolved library: ', tsnodePath);
		const tsnode: typeof import('ts-node') = require(tsnodePath);

		const tsPath = await configuration.rigPackageResolver.resolvePackageAsync('typescript', session.logger.terminal);
		session.logger.terminal.writeDebugLine('resolved library: ', tsPath);
		tsnode.register({
			compiler: tsPath,
			compilerOptions: {
				module: 'commonjs',
			},
			moduleTypes: {},
		});
		tsnodeinited = true;
	}
}

async function loadRaw(
	filename: string,
	session: IHeftTaskSession,
	configuration: HeftConfiguration
): Promise<IUserInput> {
	if (filename.endsWith('ts')) {
		await registerTsNode(session, configuration);
		return require(filename);
	}
	if (filename.endsWith('.cjs')) {
		const req = require(filename);
		return req.default?.options ? req.default : req;
	}
	if (filename.endsWith('.mjs')) {
		return await import(filename);
	}
	if (filename.endsWith('.json')) {
		const options = parse(await readFile(filename, 'utf-8'), undefined, true) as any;
		return { options };
	}
	throw new Error('this is impossible');
}
