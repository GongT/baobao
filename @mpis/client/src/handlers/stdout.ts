import { PassThrough, Transform, type TransformOptions } from 'node:stream';
import type { WriteStream } from 'node:tty';
import split2 from 'split2';
import { channelClient } from '../common/message-channel.js';

interface IOptions {
	title?: string;
	start?: RegExp;
	stop: RegExp;
	isFailed(stop_line: string, full_output: string): boolean;
}

export function listenOnStream(stream: NodeJS.ReadableStream, options: IOptions) {
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

			started = false;

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

export function joinMultipleTextStream(streams: NodeJS.ReadableStream[]) {
	streams = [...streams];
	const joinStream = new PassThrough({});
	for (const stream of streams) {
		stream.pipe(joinStream, { end: false });
		stream.on('end', () => {
			const index = streams.indexOf(stream);
			if (index !== -1) {
				streams.splice(index, 1);
			}
			if (streams.length === 0) {
				joinStream.end();
			}
		});
	}
	return joinStream;
}

interface IHookOptions {
	injection?(who: 'stdout' | 'stderr'): NodeJS.ReadWriteStream | undefined;
	transform?: TransformOptions['transform'];
}

export function hookCurrentProcessOutput({ transform, injection }: IHookOptions) {
	function makePipeFunction(who: 'stdout' | 'stderr', original: WriteStream) {
		const injection_stream = injection?.(who);
		if (!injection_stream && !transform) {
			// 没有注入流，也没有转换需求
			return;
		}

		const hook = transform ? new Transform({ transform }) : new PassThrough();
		const originalWrite = original.write.bind(original);

		original.write = hook.write.bind(hook); // 任何对stdout/err的写入都会改成对hook流的写入

		// 但是hook本身向stdout/err写入时需要绕过hook，否则就死循环了
		// mocked 等价于原始版本的 stdout/err
		const mocked = new Proxy(original, {
			get(target, prop, receiver) {
				if (prop === 'write') {
					return originalWrite;
				}
				return Reflect.get(target, prop, receiver);
			},
		});

		if (injection_stream) {
			hook.pipe(injection_stream, { end: true }).pipe(mocked, { end: false });
		} else if (transform) {
			hook.pipe(mocked, { end: false });
		}
	}

	makePipeFunction('stdout', process.stdout);
	makePipeFunction('stderr', process.stderr);
}
