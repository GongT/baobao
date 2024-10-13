import { TscWrapper } from '@internal/local-esbuild';
import { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';
import { resolve } from 'node:path';

export const PLUGIN_NAME = 'tsc-exec';

export default class TscPlugin implements IHeftTaskPlugin {
	private startPromise?: Promise<TscWrapper>;

	apply(session: IHeftTaskSession, configuration: HeftConfiguration): void {
		async function startTsc(watch: boolean) {
			const tspkg = await configuration.rigPackageResolver.resolvePackageAsync(
				'typescript',
				session.logger.terminal,
			);
			const tsc = resolve(tspkg, 'bin/tsc');
			const args = ['--project', 'src/tsconfig.json', '--pretty', '--preserveWatchOutput'];
			if (watch) args.push('--watch');

			const control = new TscWrapper(tsc, args, configuration.buildFolderPath);

			control.on('debug', (line) => session.logger.terminal.writeLine(line));
			control.on('log', (line) => session.logger.terminal.writeLine(line));

			return control;
		}

		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const control = await startTsc(false);
			await control.waitQuit();
			session.logger.terminal.writeLine('tsc build success');
		});
		session.hooks.runIncremental.tapPromise(PLUGIN_NAME, async (context) => {
			if (!this.startPromise) {
				this.startPromise = startTsc(true);
			}
			const control = await this.startPromise;

			const error = await control.waitNextCompile();
			if (error instanceof Error) {
				session.logger.emitError(error);
			} else {
				session.logger.terminal.writeLine('tsc watch success');
			}

			await context.watchGlobAsync('src/**/*.ts', { cwd: configuration.buildFolderPath });
		});
	}
}
