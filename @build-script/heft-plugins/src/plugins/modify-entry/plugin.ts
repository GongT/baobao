import type { HeftConfiguration, IHeftTaskPlugin, IHeftTaskSession, IScopedLogger } from '@rushstack/heft';
import { chmod, readFile, writeFile } from 'fs/promises';
import { resolve } from 'path';

interface IAction {
	chmod?: boolean;
	prefix?: string;
	suffix?: string;
	missing?: boolean;
}

interface IMyOptions {
	bin?: IAction;
	main?: IAction;
	module?: IAction;
}

const PLUGIN_NAME = 'shell';

export default class RunShellPlugin implements IHeftTaskPlugin<IMyOptions> {
	apply(session: IHeftTaskSession, configuration: HeftConfiguration, options?: IMyOptions): void {
		session.hooks.run.tapPromise(PLUGIN_NAME, async () => {
			const pkg = require(resolve(configuration.buildFolderPath, 'package.json'));

			const ps = [];
			if (options?.bin) {
				if (typeof pkg.bin === 'object') {
					for (const file of Object.values(pkg.bin)) {
						if (typeof file !== 'string') continue;

						ps.push(this.fix(configuration.rigConfig, file, options.bin, session.logger));
					}
				} else {
					ps.push(this.fix(configuration.rigConfig, pkg.bin, options.bin, session.logger));
				}
			}
			if (options?.main) {
				ps.push(this.fix(configuration.rigConfig, pkg.main, options.main, session.logger));
			}
			if (options?.module) {
				ps.push(this.fix(configuration.rigConfig, pkg.module, options.module, session.logger));
			}

			await Promise.all(ps);
		});
	}

	async fix(rig: HeftConfiguration['rigConfig'], rel: string, act: IAction, logger: IScopedLogger) {
		const file = resolve(rig.projectFolderPath, rel);
		logger.terminal.writeVerboseLine('modify file: ', file);

		let data = await readFile(file, 'utf-8');
		let change = false;

		if (act.chmod) {
			logger.terminal.writeVerboseLine(' * chmod 0755');
			await chmod(file, 0o775);
		}
		if (act.prefix) {
			const prefix = await parse(rig, act.prefix, !!act.missing, logger);
			if (prefix && !data.trimEnd().startsWith(prefix)) {
				logger.terminal.writeVerboseLine(' * prepend string');
				data = prefix + '\n' + data.trimStart();
				change = true;
			}
		}
		if (act.suffix) {
			const suffix = await parse(rig, act.suffix, !!act.missing, logger);
			if (suffix && !data.trimEnd().endsWith(suffix)) {
				logger.terminal.writeVerboseLine(' * append string');
				data = data.trimEnd() + '\n' + suffix + '\n';
				change = true;
			}
		}

		if (change) {
			await writeFile(file, data);
			logger.terminal.writeVerboseLine(' * commit file content');
		}
	}
}

async function parse(rig: HeftConfiguration['rigConfig'], input: string, allowMissing: boolean, logger: IScopedLogger) {
	if (!input.startsWith('<')) return input;

	let r;
	input = input.slice(1).trim();

	const p1 = resolve(rig.projectFolderPath, input);
	r = await read(p1, logger);
	if (r) return r;

	if (rig.rigFound) {
		const ppath = await rig.getResolvedProfileFolderAsync();

		const p2 = resolve(ppath, input);
		r = await read(p2, logger);
		if (r) return r;

		const p3 = resolve(ppath, '../..', input);
		r = await read(p3, logger);
		if (r) return r;
	}

	if (allowMissing) {
		logger.terminal.writeVerboseLine('can not find one');
		return undefined;
	}

	throw new Error('missing file: ' + input);
}

async function read(f: string, logger: IScopedLogger) {
	logger.terminal.writeVerboseLine('try to read file: ', f);
	try {
		return await readFile(f, 'utf-8');
	} catch (e: any) {
		logger.terminal.writeVerboseLine(e.message);
		return undefined;
	}
}
