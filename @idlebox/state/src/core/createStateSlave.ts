import { StateSlave } from '../ipc/client';
import { IPCDriver } from '../ipc/protocol';

export function createSlave(channel: IPCDriver): StateSlave {
	return new StateSlave(channel);
}
