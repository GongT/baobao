import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession } from '@rushstack/heft';
import { execa } from 'execa';
import { resolve } from 'path';

interface IMyOptions {
	interpreter?: string;
	interpreterArgs?: string[];
	script: string;
	args?: string[];
	env?: Record<string, string>;
	inheritEnv?: boolean;
	workingDirectory?: string;
}

const PLUGIN_NAME = 'shell';

export default class RunShellPlugin implements IHeftTaskPlugin<IMyOptions> {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options?: IMyOptions): void {
		if (!options) {
			session.logger.emitError(new Error('scriptOptions is not defined'));
			return;
		}

		session.hooks.run.tapPromise(PLUGIN_NAME, () => {
			return this.execute(session, configuration, options);
		});
	}

	async execute(session: IHeftTaskSession, configuration: HeftConfiguration, options: IMyOptions) {
		session.logger.terminal.writeVerboseLine(JSON.stringify(options, null, 4));

		let exe: string = options.interpreter ?? process.execPath;
		const args: string[] = [];

		if (Array.isArray(options.interpreterArgs) && options.interpreterArgs.length) {
			args.push(...options.interpreterArgs);
		}

		args.push(options.script);

		if (Array.isArray(options.args) && options.args.length) {
			args.push(...options.args);
		}

		let cwd = configuration.buildFolderPath;
		if (options.workingDirectory) {
			cwd = resolve(cwd, options.workingDirectory);
		}

		let dbg = '';
		dbg += `\x1B[2m$ ${exe} ${args.join(' ')}`;
		if (cwd) {
			dbg += ` (wd: ${cwd})`;
		}
		dbg += `\x1B[0m`;
		session.logger.terminal.writeLine(dbg);

		const result = await execa(exe, args, {
			cwd: cwd,
			env: options.env,
			preferLocal: true,
			extendEnv: options.inheritEnv !== false,
			shell: false,
			stdio: 'inherit',
			windowsHide: true,
		});

		if (result.signal) {
			const desc = result.signalDescription ? ` (${result.signalDescription})` : '';
			session.logger.emitError(new Error(`process killed by signal ${result.signal}${desc}`));
			return;
		}

		if (result.exitCode !== 0) {
			session.logger.emitError(new Error(`process exited with code ${result.exitCode}`));
			return;
		}
	}
}
