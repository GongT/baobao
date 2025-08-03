import { logger } from '@idlebox/logger';
import { readlineTestInit } from '../clients/test-input.client.js';
import { ModeKind, WorkersManager } from '../common/workers-manager.js';
import { test_manual } from './shared/functions.js';

const workersManager = new WorkersManager(ModeKind.Watch, logger);

// process.stderr.write('\x1Bc');

const test1 = test_manual();
const test2 = test_manual();
const test2a = test_manual();
const test2b = test_manual();
const test3 = test_manual();
const test4 = test_manual();

const testaa = test_manual();

workersManager.addWorker(test1, [test2._id]);
workersManager.addWorker(test2, [test2a._id, test2b._id]);
workersManager.addWorker(test3, [testaa._id]);
workersManager.addWorker(test4, [testaa._id]);
workersManager.addWorker(test2a, []);
workersManager.addWorker(test2b, [testaa._id]);
workersManager.addWorker(testaa, []);

setTimeout(() => {
	readlineTestInit(workersManager);
}, 2000);

await workersManager.finalize().startup();
logger.info('all workers finished!!');
