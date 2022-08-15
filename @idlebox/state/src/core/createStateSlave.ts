import { StateSlave } from '../ipc/client';
import { IPCDriver } from '../ipc/protocol';

/**
 * 创建 [StateMaster]，应在子线程调用
 * @public
 * @param channel
 */
export function createSlave(channel: IPCDriver): StateSlave {
	return new StateSlave(channel);
}
