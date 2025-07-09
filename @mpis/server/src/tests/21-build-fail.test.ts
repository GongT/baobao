import { registerGlobalLifecycle, toDisposable } from '@idlebox/common';
import { createRootLogger, EnableLogLevel, logger, set_default_log_level } from '@idlebox/logger';
import { shutdown } from '@idlebox/node';
import { ModeKind, WorkersManager } from '../common/workers-manager.js';
import { test_fail_quit, test_success_quit } from './shared/functions.js';

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

const choose = Math.round(Math.random() * 6) + 1;
// const choose = 7;

const test1 = choose === 1 ? test_fail_quit() : test_success_quit();
const test2 = choose === 2 ? test_fail_quit() : test_success_quit();
const test2a = choose === 3 ? test_fail_quit() : test_success_quit();
const test2b = choose === 4 ? test_fail_quit() : test_success_quit();
const test3 = choose === 5 ? test_fail_quit() : test_success_quit();
const test4 = choose === 6 ? test_fail_quit() : test_success_quit();

const testaa = choose === 7 ? test_fail_quit() : test_success_quit();

const ts = [test1, test2, test2a, test2b, test3, test4, testaa];
logger.warn`current choose: ${choose} [${ts.map((e) => e._id).join(', ')}]`;

workersManager.addWorker(test1, [test2._id]);
workersManager.addWorker(test2, [test2a._id, test2b._id]);
workersManager.addWorker(test3, [testaa._id]);
workersManager.addWorker(test4, [testaa._id]);
workersManager.addWorker(test2a, []);
workersManager.addWorker(test2b, [testaa._id]);
workersManager.addWorker(testaa, []);

await workersManager.startup().then(
	() => {
		logger.fatal('all workers completed!!');
		shutdown(1);
	},
	() => {
		logger.success`great, error catches!!`;
		shutdown(0);
	},
);
