import { createRootLogger, EnableLogLevel, logger, set_default_log_level } from '@idlebox/logger';
import { readlineTestInit } from '../clients/test-input.client.js';
import { workersManager } from '../common/workers-manager.js';
import { test_manual } from './shared/functions.js';

process.stderr.write('\x1Bc')
createRootLogger('test', EnableLogLevel.verbose);
set_default_log_level(EnableLogLevel.verbose);

const test1 = test_manual();
const test2 = test_manual();
const test2a = test_manual();
const test2b = test_manual();
const test3 = test_manual();
const test4 = test_manual();

const testaa = test_manual();

workersManager.addWorker(test1, [test2]);
workersManager.addWorker(test2, [test2a, test2b]);
workersManager.addWorker(test3, [testaa]);
workersManager.addWorker(test4, [testaa]);
workersManager.addWorker(test2a, []);
workersManager.addWorker(test2b, [testaa]);
workersManager.addWorker(testaa, []);

setTimeout(() => {
	readlineTestInit();
}, 2000);

await workersManager.finalize();
logger.info('all workers started!!');
