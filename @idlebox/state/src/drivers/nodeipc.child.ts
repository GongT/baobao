import { IPCDriver } from '../ipc/protocol';
import { IProcessSlice, NodeIPCBase } from './nodeipc.base';

export class NodeIPCChild extends NodeIPCBase implements IPCDriver {
	constructor(title: string = process.pid.toString()) {
		if (!process.send) {
			throw new Error('no process.send(), ipc not enabled');
		}
		super(title, process as IProcessSlice);
	}
}
