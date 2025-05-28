import type { ChildProcessByStdio } from 'node:child_process';
import { PassThrough, type Readable } from 'node:stream';
import split2 from 'split2';
import { channelClient } from '../common/message-channel.js';
import { make_message } from '../common/tools.js';
import { BuildEvent, type IMessageObject } from '../types.js';

interface IOptions {
	title: string;
	start: RegExp;
	stop: RegExp;
	isFailed(stop_line: string, full_output: string): boolean;
}

export function registerChildProcessOutput(cp: ChildProcessByStdio<any, Readable, null | Readable>, options: IOptions) {
	let stored_outputs = '';
	function outputHandle(line_data: Buffer) {
		const line = line_data.toString();
		stored_outputs += `${line}\n`;
		let message: IMessageObject | undefined;
		if (options.start.test(line)) {
			stored_outputs = '';
			message = make_message(BuildEvent.Start, options.title);
		} else if (options.stop.test(line)) {
			const succ = options.isFailed(line, stored_outputs) ? BuildEvent.Success : BuildEvent.Failed;
			message = make_message(succ, options.title, stored_outputs);
		}

		if (message) {
			channelClient.send(message);
		}
	}

	let stream: Readable;
	if ('all' in cp && 'pipe' in (cp.all as any)) {
		// execa
		stream = cp.all as Readable;
	} else {
		const pass = new PassThrough();
		cp.stdout.pipe(pass);
		cp.stderr?.pipe(pass);
		stream = pass;
	}
	stream.pipe(split2()).on('data', outputHandle);
}
