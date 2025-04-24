/**
 * 这个文件的协议用于codegen和父进程（如果有）之间通信
 */
export interface IBuildEvent {
	__name__: 'build_event';
	type: 'start' | 'stop';
	data: any;
}

export interface IBuildComplete {
	count: number;
	schedule: number;
	success: number;
	skip: number;
	errors: { error: string; source: string }[];
}

export interface IBuildStart {
	files: string[];
	generator: number;
}

export function emitIpcMessage(type: 'start' | 'stop', data: any): void {
	if (process.send) {
		process.send({ __name__: 'build_event', type, data });
	}
}
