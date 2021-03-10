import { createMaster, createSameProcessChild, createSameProcessMain, createSlave } from '../../..';
import { createMainLogic } from '../share.main';
import { createProcessLogic_1 } from '../share.process1';
import { createProcessLogic_2 } from '../share.process2';

const child1 = createSameProcessMain('child1');
const child2 = createSameProcessMain('child2');

const store = createMaster();
store.attach(child1);
store.attach(child2);

createMainLogic(store);

/// child1
(() => {
	const driver = createSameProcessChild('child1');
	const store = createSlave(driver);

	createProcessLogic_1(store);
})();

/// child2
(() => {
	const driver = createSameProcessChild('child2');
	const store = createSlave(driver);

	createProcessLogic_2(store);
})();
