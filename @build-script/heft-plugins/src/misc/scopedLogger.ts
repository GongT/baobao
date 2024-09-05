import type { IHeftTaskSession } from '@rushstack/heft';
import { format } from 'util';

export interface IOutputShim {
	log(msg: string, ...args: any[]): void;
	error(msg: string, ...args: any[]): void;
	debug(msg: string, ...args: any[]): void;
	verbose(msg: string, ...args: any[]): void;
	warn(msg: string, ...args: any[]): void;
}

export function wrapLogger(logger: IOutputShim, prefix: string): IOutputShim {
	return {
		log: (msg: string, ...args: any[]) => {
			logger.log(format(prefix + msg, ...args));
		},
		error: (msg: string, ...args: any[]) => {
			logger.error(format(prefix + msg, ...args));
		},
		warn: (msg: string, ...args: any[]) => {
			logger.warn(format(prefix + msg, ...args));
		},
		verbose: (msg: string, ...args: any[]) => {
			logger.verbose(format(prefix + msg, ...args));
		},
		debug: (msg: string, ...args: any[]) => {
			logger.debug(format(prefix + msg, ...args));
		},
	};
}
export function createHeftLogger(session: IHeftTaskSession): IOutputShim {
	return {
		log: (msg: string, ...args: any[]): void => {
			session.logger.terminal.writeLine(format(msg, ...args));
		},
		error: (msg: string, ...args: any[]): void => {
			session.logger.terminal.writeErrorLine(format(msg, ...args));
		},
		warn: (msg: string, ...args: any[]): void => {
			session.logger.terminal.writeWarningLine(format(msg, ...args));
		},
		verbose: (msg: string, ...args: any[]): void => {
			session.logger.terminal.writeVerboseLine(format(msg, ...args));
		},
		debug: (msg: string, ...args: any[]): void => {
			session.logger.terminal.writeDebugLine(format(msg, ...args));
		},
	};
}

export function createTerminalLogger(): IOutputShim {
	return {
		log: console.log,
		error: console.error,
		warn: console.warn,
		verbose: console.debug,
		debug: console.debug,
	};
}
