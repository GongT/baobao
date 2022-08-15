import { IPCServerDriver } from '@idlebox/state';
import { IProcessSlice, NodeIPCBase } from './nodeipc.base';

export class NodeIPCMain extends NodeIPCBase implements IPCServerDriver {
	constructor(title: string, channel: IProcessSlice) {
		super(title, channel);
	}
}
