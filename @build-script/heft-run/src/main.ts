import type { IRunScriptOptions } from '@rushstack/heft';
import { execa } from 'execa';
import { resolve } from 'path';

interface IMyOptions {
	interpreter?: { path: string; args?: string[] } | string;
	script: string;
	args?: string[];
	env?: Record<string, string>;
	inheritEnv?: boolean;
	workingDirectory?: string;
}

export async function runAsync({
	scopedLogger: logger,
	scriptOptions: options,
	heftConfiguration: configuration,
}: IRunScriptOptions<any> & { scriptOptions: IMyOptions }) {
	logger.terminal.writeDebugLine(JSON.stringify(options, null, 4));

	let exe: string = process.execPath;
	const args: string[] = [];

	if (options.interpreter) {
		if (typeof options.interpreter === 'string') {
			exe = options.interpreter;
		} else if (options.interpreter) {
			const { path, args: iargs } = options.interpreter;
			if (typeof path !== 'string') {
				logger.emitError(new Error('scriptOptions.interpreter.path is not an array'));
				return;
			}

			exe = path;
			if (iargs) {
				if (!Array.isArray(iargs)) {
					logger.emitError(new Error('scriptOptions.interpreter.args is not an array'));
					return;
				}
				args.push(...iargs);
			}
		} else {
			logger.emitError(new Error('scriptOptions.interpreter is invalid'));
			return;
		}
	}

	if (typeof options.script !== 'string') {
		logger.emitError(new Error('scriptOptions.script is not a string'));
		return;
	}
	args.push(options.script);

	if (options.args) {
		if (!Array.isArray(options.args)) {
			logger.emitError(new Error('scriptOptions.args is not a string'));
			return;
		}

		args.push(...options.args);
	}

	let cwd = undefined;
	if (options.workingDirectory) {
		cwd = resolve(configuration.buildFolder, options.workingDirectory);
	}

	const dbg = [];
	dbg.push({ foregroundColor: 8, text: `$ ${exe} ${args.join(' ')}` });
	if (cwd) {
		dbg.push({ foregroundColor: 8, text: ` (wd: ${cwd})` });
	}
	logger.terminal.writeLine(...dbg);

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
		logger.emitError(new Error(`process killed by signal ${result.signal}${desc}`));
		return;
	}

	if (result.exitCode !== 0) {
		logger.emitError(new Error(`process exited with code ${result.exitCode}`));
		return;
	}
}
