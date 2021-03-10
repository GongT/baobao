import { createSlave, NodeIPCChild } from '../../..';
import { createProcessLogic_1 } from '../share.process1';
import { createProcessLogic_2 } from '../share.process2';

const pid = process.argv[process.argv.length - 1];

const driver = new NodeIPCChild('p' + pid);
const store = createSlave(driver);

if (pid == '1') {
	createProcessLogic_1(store);
} else {
	createProcessLogic_2(store);
}
