import type { IOutputShim } from '@build-script/heft-plugin-base';
import { format } from 'node:util';
import 'source-map-support/register';
import { ImportExecuter } from './library/executer.import.js';
import { sendOutputMessage } from './library/shared.js';

function createLogSend(): IOutputShim {
	const keys = ['log', 'error', 'debug', 'verbose', 'warn'] as const;
	const child: IOutputShim = {} as any;
	for (const key of keys) {
		child[key] = (...args: any[]) => {
			sendOutputMessage({
				kind: 'log',
				type: key,
				message: format(...args),
			});
		};
	}
	return child;
}

async function main() {
	const logger = createLogSend();

	const executer = new ImportExecuter(
		process.env.projectRoot!,
		process.env.sourceFile!,
		process.env.targetFile!,
		logger
	);

	return await executer.execute(process.env.scriptFile!);
}

main().then(
	(result) => {
		sendOutputMessage({
			kind: 'success',
			changed: result.changes,
			files: [...result.userWatchFiles],
		});
		process.exit(0);
	},
	(e) => {
		sendOutputMessage({
			kind: 'error',
			error: {
				stack: e.stack,
				message: e.message,
				...e,
			},
		});
		process.exit(1);
	}
);
