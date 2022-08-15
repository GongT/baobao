import { createSlave, ElectronIPCRender } from '../../../state/dist/state-public';
import { createProcessLogic_1 } from '../share.process1';

const driver = new ElectronIPCRender('child1');
const store = createSlave(driver);

createProcessLogic_1(store);
