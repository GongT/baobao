import { createSlave, ElectronIPCRender } from '../../..';
import { createProcessLogic_2 } from '../share.process2';

const driver = new ElectronIPCRender('child2');
const store = createSlave(driver);

createProcessLogic_2(store);
