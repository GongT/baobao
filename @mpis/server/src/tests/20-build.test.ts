import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger, set_default_log_level } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { ModeKind, WorkersManager } from '../common/workers-manager.js';
import { test_success_quit } from './shared/functions.js';

const workersManager = new WorkersManager(ModeKind.Build);

registerGlobalLifecycle(
	toDisposable(() => {
		logger.info`global lifecycle cleaning up...`;
		console.error(workersManager.formatDebugGraph());
		logger.info`bye bye`;
	}),
);

process.stderr.write('\x1Bc');
createRootLogger('test', EnableLogLevel.verbose);
set_default_log_level(EnableLogLevel.verbose);

const test1 = test_success_quit(Math.random() * 500 + 200);
const test2 = test_success_quit(Math.random() * 500 + 200);
const test2a = test_success_quit(Math.random() * 500 + 200);
const test2b = test_success_quit(Math.random() * 500 + 200);
const test3 = test_success_quit(Math.random() * 500 + 200);
const test4 = test_success_quit(Math.random() * 500 + 200);

const testaa = test_success_quit(Math.random() * 500 + 200);

workersManager.addWorker(test1, [test2]);
workersManager.addWorker(test2, [test2a, test2b]);
workersManager.addWorker(test3, [testaa]);
workersManager.addWorker(test4, [testaa]);
workersManager.addWorker(test2a, []);
workersManager.addWorker(test2b, [testaa]);
workersManager.addWorker(testaa, []);

await workersManager.finalize().then(
	() => {
		logger.info('all workers completed!!');
		shutdown(0);
	},
	() => {
		logger.info('some workers failed!!');
		shutdown(0);
	},
);
