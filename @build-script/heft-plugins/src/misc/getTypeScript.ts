import type TypeScriptApi from 'typescript';
import { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';

let cache: typeof TypeScriptApi;
export async function getTypeScript(session: IHeftTaskSession, configuration: HeftConfiguration) {
	if (!cache) {
		const tsToolPath = await configuration.rigPackageResolver.resolvePackageAsync(
			'typescript',
			session.logger.terminal
		);
		if (!tsToolPath) {
			throw new Error('failed find typescript library.');
		}
		cache = require(tsToolPath);
	}
	return cache;
}
