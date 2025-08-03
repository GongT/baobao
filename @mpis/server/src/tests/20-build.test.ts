import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { logger } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { ModeKind, WorkersManager } from '../common/workers-manager.js';
import { test_success_quit } from './shared/functions.js';

const workersManager = new WorkersManager(ModeKind.Build);

registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`global lifecycle cleaning up...`;
		console.error(workersManager.finalize().debugFormatGraph());
		console.error(workersManager.finalize().debugFormatSummary());
		logger.info`bye bye`;
	}),
);

const test1 = test_success_quit(Math.random() * 500 + 200);
const test2 = test_success_quit(Math.random() * 500 + 200);
const test2a = test_success_quit(Math.random() * 500 + 200);
const test2b = test_success_quit(Math.random() * 500 + 200);
const test3 = test_success_quit(Math.random() * 500 + 200);
const test4 = test_success_quit(Math.random() * 500 + 200);

const testaa = test_success_quit(Math.random() * 500 + 200);

workersManager.addWorker(test1, [test2._id]);
workersManager.addWorker(test2, [test2a._id, test2b._id]);
workersManager.addWorker(test3, [testaa._id]);
workersManager.addWorker(test4, [testaa._id]);
workersManager.addWorker(test2a, []);
workersManager.addWorker(test2b, [testaa._id]);
workersManager.addWorker(testaa, []);

await workersManager
	.finalize()
	.startup()
	.then(
		() => {
			logger.info('all workers completed!!');
			shutdown(0);
		},
		() => {
			logger.info('some workers failed!!');
			shutdown(0);
		},
	);
