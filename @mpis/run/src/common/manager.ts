import { logger } from '@idlebox/logger';
import { channelClient } from '@mpis/client';
import { ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { context } from './args.js';
import { config } from './config-file.js';
import { formatAllErrors, overallState, reprintWatchModeError, updateMiscState } from './print-screen.js';

export let workersManager: WorkersManager;

export function initializeWorkers() {
	workersManager = new WorkersManager(context().watchMode ? ModeKind.Watch : ModeKind.Build);

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
		worker.onStart(() => {
			logger.debug`worker ${worker._id} start compiling...`;
			overallState.busyWorkers.add(worker._id);
			overallState.startedWorkers.add(worker._id);
			updateMiscState();
		});
		worker.onFailure((e) => {
			logger.debug`worker ${worker._id} failed: ${e.message}`;
			overallState.busyWorkers.delete(worker._id);
			overallState.errors.set(worker._id, e);
			overallState.startedWorkers.add(worker._id);
			reprintWatchModeError(nodeFirstTime);
			nodeFirstTime = false;
			sendStatus();
		});
		worker.onSuccess(() => {
			logger.debug`worker ${worker._id} succeeded.`;
			overallState.busyWorkers.delete(worker._id);
			overallState.errors.delete(worker._id);
			overallState.startedWorkers.add(worker._id);
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
	logger.debug`worker counting: ${overallState.busyWorkers.size} busy; ${overallState.startedWorkers.size} started; ${workersManager.size()} total.`;

	if (overallState.errors.size === 0) {
		if (overallState.busyWorkers.size === 0 && overallState.startedWorkers.size === workersManager.size()) {
			channelClient.success(`all ${workersManager.size()} workers completed successfully.`);
		}
	} else {
		const arr = overallState.errors.keys().toArray();
		channelClient.failed(`mpis-run: ${arr.join(', ')} (${overallState.errors.size} / ${workersManager.size()})`, formatAllErrors(true));
	}
}
