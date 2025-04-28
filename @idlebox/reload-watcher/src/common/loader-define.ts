import { FSWatcher } from 'chokidar';
import {
	isBuiltin,
	type InitializeHook,
	type LoadFnOutput,
	type LoadHook,
	type LoadHookContext,
	type ResolveFnOutput,
	type ResolveHook,
	type ResolveHookContext,
} from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { NextFunction } from './temp-types.js';
import type { IPassing } from './types.js';

const ignore = /[?&]ignore=true/;

interface IAsyncHook<T = IPassing> {
	initialize: InitializeHook<T>;
	resolve: ResolveHook;
	load: LoadHook;
}

class LoaderState implements IAsyncHook<void> {
	private readonly chokidar: FSWatcher;

	constructor(private readonly data: IPassing) {
		const chokidar = new FSWatcher({
			ignoreInitial: true,
		});

		const versionState = new Map<string, number>();
		chokidar.on('change', (path) => {
			const url = pathToFileURL(path).href;
			const cacheId = (versionState.get(url) ?? 0) + 1;
			versionState.set(url, cacheId);
			console.log('[chokidar] file changed: %s, cache_id: %d', path, cacheId);
		});

		this.chokidar = chokidar;
	}

	async initialize() {}

	async resolve(
		specifier: string,
		context: ResolveHookContext,
		nextResolve: NextFunction<ResolveFnOutput>
	): Promise<ResolveFnOutput> {
		if (specifier.startsWith('node:')) {
			return { format: 'builtin', url: specifier, shortCircuit: true };
		} else if (isBuiltin(specifier)) {
			return { format: 'builtin', url: `node:${specifier}`, shortCircuit: true };
		}

		const r = nextResolve(specifier, context);
		if (ignore.test(specifier)) {
			return r;
		}

		console.log('[hook][resolve] try: %s', r.url);
		if (r.url.startsWith(rootDirUri) && !r.url.includes('/node_modules/')) {
			chokidar.add(fileURLToPath(r.url));
			const url = `${r.url}?cache_id=${cache_state.get(r.url) ?? 0}`;
			console.log('[hook][resolve]    -> %s', url);
			return {
				format: r.format,
				importAttributes: r.importAttributes,
				url: url,
				shortCircuit: true,
			};
		}
		return r;
	}

	load(url: string, context: LoadHookContext, nextLoad: NextFunction<LoadFnOutput>): Promise<LoadFnOutput> {}
}

let state: LoaderState | undefined;

export const loader: IAsyncHook = {
	async initialize(data: IPassing) {
		if (state) {
			console.warn('loader already initialized');
			return;
		}

		state = new LoaderState(data);
		await state.initialize();
	},

	resolve(specifier, context, nextResolve) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		return state!.resolve(specifier, context, nextResolve);
	},

	load(url, context, nextLoad) {
		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		return state!.load(url, context, nextLoad);
	},
};
