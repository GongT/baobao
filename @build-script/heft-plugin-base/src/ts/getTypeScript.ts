import type TypeScriptApi from 'typescript';
import type { HeftConfiguration, IHeftTaskSession } from '@rushstack/heft';

export async function getTypeScript(
	session: IHeftTaskSession,
	configuration: HeftConfiguration
): Promise<typeof TypeScriptApi> {
	const tsToolPath = await configuration.rigPackageResolver.resolvePackageAsync('typescript', session.logger.terminal);
	if (!tsToolPath) {
		throw new Error('failed find typescript library.');
	}
	return require(tsToolPath);
}
