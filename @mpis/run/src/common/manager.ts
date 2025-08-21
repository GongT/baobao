import { logger } from '@idlebox/logger';
import { channelClient } from '@mpis/client';
import { ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { context } from './args.js';
import { config } from './config-file.js';
import { errors, formatAllErrors, reprintWatchModeError } from './print-screen.js';

export const workersManager = new WorkersManager(context.watchMode ? ModeKind.Watch : ModeKind.Build);

export function initializeWorkers() {
	let last: ProcessIPCClient | undefined;
	for (const title of config.buildTitles) {
		const cmds = config.build.get(title);
		if (!cmds) throw logger.fatal`program state error, no build command "${title}"`;

		if (!cmds.env['DEBUG']) cmds.env['DEBUG'] = '';
		if (!cmds.env['DEBUG_LEVEL']) cmds.env['DEBUG_LEVEL'] = '';
		const worker = new ProcessIPCClient(title.replace(/\s+/g, ''), cmds.command, cmds.cwd, cmds.env);

		for (const path of config.additionalPaths) {
			worker.pathvar.add(path);
		}

		worker.displayTitle = `run:${cmds.command[0]}`;

		workersManager.addWorker(worker, last ? [last._id] : []);

		let nodeFirstTime = true;
		worker.onFailure((e) => {
			errors.set(worker, e);
			reprintWatchModeError(nodeFirstTime);
			nodeFirstTime = false;
			sendStatus();
		});
		worker.onSuccess(() => {
			errors.set(worker, null);
			if (nodeFirstTime) {
				nodeFirstTime = false;
			} else {
				reprintWatchModeError();
			}
			sendStatus();
		});

		last = worker;
	}
}

function sendStatus() {
	const noError = errors.values().every((e) => !e);
	if (noError) {
		channelClient.success(`all ${workersManager.size()} workers completed successfully.`);
	} else {
		let errorCnt = 0;
		const arr: string[] = [];
		for (const [client, err] of errors.entries()) {
			if (err) {
				errorCnt++;
				arr.push(client._id);
			}
		}
		channelClient.failed(`mpis-run: ${arr.join(', ')} (${errorCnt} / ${workersManager.size()})`, formatAllErrors());
	}
}
