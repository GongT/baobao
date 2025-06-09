import { PassThrough } from 'node:stream';
import split2 from 'split2';
import { channelClient } from '../common/message-channel.js';

interface IOptions {
	title?: string;
	start?: RegExp;
	stop: RegExp;
	isFailed(stop_line: string, full_output: string): boolean;
}

export function listenOutputStream(stream: NodeJS.ReadableStream, options: IOptions) {
	if (options.title) channelClient.friendlyTitle = options.title;

	function emit_failed() {
		channelClient.failed('matching failed output', memory);
		memory = '';
	}
	function emit_success() {
		channelClient.success('matching success output', memory);
		memory = '';
	}

	function emit_start() {
		channelClient.start();
		memory = '';
	}

	const reading_stream = split2();

	let memory = '';
	let started = false;
	let lastFailed = false;

	reading_stream.on('end', () => {
		if (started || lastFailed) {
			emit_failed();
			process.exitCode = 1;
		}
	});

	reading_stream.on('data', (line: string) => {
		if (started) {
			memory += line;
			memory += '\n';
			if (!options.stop.test(line)) return;

			lastFailed = options.isFailed(line, memory);
			if (lastFailed) {
				emit_failed();
			} else {
				emit_success();
			}
			return;
		} else if (options.start) {
			// 如果有开始signal，尝试匹配，失败继续等
			// 成功的话设置started，然后返回以确保丢弃当前行
			started = options.start.test(line);
			if (!started) return;
			emit_start();
		} else {
			started = true;
			emit_start();
		}

		memory += line;
		memory += '\n';
	});

	stream.pipe(reading_stream, { end: true });
}
export function hookCurrentProcessOutput(options: IOptions) {
	const pipe = new PassThrough({});
	listenOutputStream(pipe, options);

	function makePipeFunction(originalWrite: (...args: any[]) => boolean) {
		return function (this: NodeJS.WriteStream, ...args: any[]) {
			pipe.write.apply(pipe, args as any);
			return originalWrite.apply(this, args);
		};
	}

	process.stdout.write = makePipeFunction(process.stdout.write);
	process.stderr.write = makePipeFunction(process.stderr.write);
}
