import { isDebug } from '@build-script/heft-plugin-base';
import { execaNode } from 'execa';
import { resolve } from 'path';
import { BaseExecuter, type IGenerateResult } from './executer.base.js';
import type { IOutputProtocol, IProtocolMessage } from './shared.js';

const scriptEntry = process.env.IS_REALTIME_BUILD
	? resolve(__dirname, '../loader/executer-thread.js')
	: resolve(__dirname, '../executer-thread.js');

function parseOutputLine(line: string): IProtocolMessage {
	try {
		if (line.startsWith('{') && line.endsWith('}')) {
			return JSON.parse(line);
		}
	} catch {}
	return { kind: 'log', type: 'error', message: line };
}

export class ThreadExecuter extends BaseExecuter {
	protected override async _execute(scriptFile: string): Promise<IGenerateResult> {
		const args = [];
		if (isDebug) {
			args.push('--debug');
		}
		const process = execaNode(scriptEntry, args, {
			stdio: ['ignore', 'pipe', 'pipe'],
			nodeOptions: ['--enable-source-maps'],
			encoding: 'utf8',
			stripFinalNewline: true,
			buffer: false,
			all: true,
			throw: false,
			verbose: isDebug ? 'short' : undefined,
			env: {
				projectRoot: this.projectRoot,
				sourceFile: this.sourceFile,
				targetFile: this.targetFile,
				scriptFile: scriptFile,
			},
		});
		this.logger.verbose('process started');

		let complete = false,
			error,
			data;
		const outputs: IOutputProtocol[] = [];

		try {
			for await (const line of process.iterable({ from: 'all' })) {
				const pline = parseOutputLine(line);
				if (pline.kind === 'log') {
					this.logger[pline.type](pline.message);
					outputs.push(pline);
				} else if (pline.kind === 'error') {
					if (complete) throw new Error('critical error: success or error multiple times');

					complete = true;
					const err = recoverError(pline.error);
					outputs.push({ kind: 'log', type: 'error', message: err.stack || err.message });
					error = err;
				} else if (pline.kind === 'success') {
					if (complete) throw new Error('critical error: success or error multiple times');

					complete = true;
					data = pline;
				} else {
					this.logger.error(line);
					outputs.push({ kind: 'log', type: 'error', message: line });
				}
			}

			const result = await process;
			this.logger.verbose('process finished');

			return {
				outputs: [],
				changes: data?.changed ?? false,
				error,
				success: !result.failed && !error,
				userWatchFiles: new Set(data?.files ?? []),
			};
		} catch (e: any) {
			return this.errorResult(error || e);
		}
	}
}

function recoverError(err: Record<string, any>) {
	const e = new Error(err.message);
	e.stack = err.stack;
	Object.assign(e, err);
	return e;
}
