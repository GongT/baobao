import { globalObject } from '@idlebox/common';
import process from 'node:process';
import { PassThrough } from 'node:stream';
import { create } from './create.logger.js';
import { EnableLogLevel, type IMyLogger } from './types.js';

const stream = new PassThrough();
stream.pipe(process.stderr);
Object.assign(stream, { isTTY: process.stderr.isTTY });

const symbol = Symbol.for('@idlebox/logger/global/terminal');

/**
 * 作为logger导出，必须在程序入口调用过 createGlobalLogger() 才能使用
 */
export let terminal: IMyLogger;

/**
 * 创建root-logger，随后logger变量可用
 */
export function createGlobalLogger(tag: string, defaultLevel: EnableLogLevel = EnableLogLevel.auto): void {
	terminal = globalObject[symbol];
	if (terminal) {
		terminal.error`global logger already created`;
		return;
	}

	terminal = create(tag, undefined, stream);
	globalObject[symbol] = terminal;

	terminal.enable(defaultLevel || EnableLogLevel.log);

	if (terminal.verbose.isEnabled) {
		terminal.verbose`verbose is enabled`;
	} else {
		terminal.debug`debug is enabled`;
	}
	return;
}
