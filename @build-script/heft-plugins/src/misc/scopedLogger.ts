import type { IHeftTaskSession } from '@rushstack/heft';
import { format } from 'util';

export interface IOutputShim {
	log(msg: string, ...args: any[]): void;
	error(msg: string, ...args: any[]): void;
	debug(msg: string, ...args: any[]): void;
	warn(msg: string, ...args: any[]): void;
}

export function createHeftLogger(session: IHeftTaskSession): IOutputShim {
	return {
		log: function (msg: string, ...args: any[]): void {
			session.logger.terminal.writeLine(format(msg, ...args));
		},
		error: function (msg: string, ...args: any[]): void {
			session.logger.terminal.writeErrorLine(format(msg, ...args));
		},
		warn: function (msg: string, ...args: any[]): void {
			session.logger.terminal.writeWarningLine(format(msg, ...args));
		},
		debug: function (msg: string, ...args: any[]): void {
			session.logger.terminal.writeVerboseLine(format(msg, ...args));
		},
	};
}

export function createTerminalLogger(): IOutputShim {
	return console;
}
