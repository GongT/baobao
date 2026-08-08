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

interface IListenSummary {
	lastState: 'success' | 'failed' | 'start' | 'unknown';
	memory: string;
}

export function listenOnStream(stream: NodeJS.ReadableStream, options: IOptions) {
	const { promise, resolve } = Promise.withResolvers<IListenSummary>();

	if (options.title) channelClient.friendlyTitle = options.title;

	let everEmit = false;
	function emit_failed() {
		channelClient.logger.verbose`emit_failed()`;
		channelClient.failed('匹配到生成失败标志', memory);
		memory = '';
		everEmit = true;
	}
	function emit_success() {
		channelClient.logger.verbose`emit_success()`;
		channelClient.success('匹配到生成成功标志', memory);
		memory = '';
		everEmit = true;
	}

	function emit_start() {
		channelClient.logger.verbose`emit_start()`;
		channelClient.start();
		memory = '';
		everEmit = true;
	}

	const reading_stream = split2();

	let memory = '';
	let started = false;
	let lastFailed = false;

	function done() {
		let state: IListenSummary['lastState'] = 'unknown';
		if (started) {
			state = 'start';
		} else if (lastFailed) {
			state = 'failed';
		} else if (everEmit) {
			state = 'success';
		}
		resolve({
			memory,
			lastState: state,
		});
	}

	reading_stream.on('close', () => {
		channelClient.logger.debug`监视流结束，title: ${options.title} started: ${started}`;
		if (started) {
			// 上次输出没有结束，说明是异常退出
			channelClient.failed('生成开始后，监视的流异常结束', memory).finally(done);
			process.exitCode = 1;
		} else {
			done();
		}
	});

	reading_stream.on('data', (line: string) => {
		if (started) {
			// 当前正在生成
			memory += line;
			memory += '\n';

			if (!options.stop.test(line)) {
				// 没有匹配到结束标志，继续等
				return;
			}

			// 匹配到结束标志，说明生成结束
			started = false;

			lastFailed = options.isFailed(line, memory);
			if (lastFailed) {
				emit_failed();
			} else {
				emit_success();
			}
			return;
		} else {
			if (options.start) {
				// 设置有开始signal，尝试匹配，失败继续等，且不记录输出
				started = options.start.test(line);
			} else {
				// 没有开始signal - 只要有输出就说明开始
				started = true;
			}
			if (started) emit_start();
			// 继续运行以记录输出，如果随后start匹配成功，则这些输出都会丢弃
			// 但如果遇到问题（异常退出），这些输出会被保留并显示在失败信息中
		}

		memory += line;
		memory += '\n';
	});

	channelClient.logger.debug`开始监视流，title: ${options.title}`;
	stream.pipe(reading_stream, { end: true });

	return promise;
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
