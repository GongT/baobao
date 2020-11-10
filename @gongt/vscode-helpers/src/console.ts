import { format } from 'util';
import { logger, VSCodeChannelLogger } from './logger.ipc';

class WrapConsole implements Console {
	constructor(private readonly logger: VSCodeChannelLogger) {
		for (const mtd of ['clear', 'debug', 'dir', 'error', 'info', 'log', 'trace', 'warn']) {
			(this as any)[mtd] = (logger as any)[mtd].bind(logger);
		}
	}

	public Console: any = WrapConsole;

	assert(value: any, message?: string, ...optionalParams: any[]): void {
		if (!value) {
			this.logger.appendLine('<assert-fail> ' + format(message, ...optionalParams));
		}
	}
	clear(): void {}
	debug(_message?: any, ..._optionalParams: any[]): void {}
	dir(_obj: any, _options?: any): void {}
	error(_message?: any, ..._optionalParams: any[]): void {}
	info(_message?: any, ..._optionalParams: any[]): void {}
	log(_message?: any, ..._optionalParams: any[]): void {}
	trace(_message?: any, ..._optionalParams: any[]): void {}
	warn(_message?: any, ..._optionalParams: any[]): void {}

	private counter: Record<string, number> = {};
	count(label: string = 'default'): void {
		if (!this.counter[label]) {
			this.counter[label] = 0;
		}
		this.log('%s: %s', label, ++this.counter[label]);
	}
	countReset(label: string = 'default'): void {
		delete this.counter[label];
	}

	dirxml(..._data: any[]): void {
		throw new Error('Method not implemented.');
	}
	group(...label: any[]): void {
		this.logger.indent();
		this.logger.info('====', ...label, '====');
	}
	groupCollapsed(...label: any[]): void {
		this.logger.indent();
		this.logger.info('====', ...label, '====');
	}
	groupEnd(): void {
		this.logger.dedent();
	}

	table(_tabularData: any, _properties?: readonly string[]): void {
		throw new Error('Method not implemented.');
	}

	private timer: Record<string, number> = {};
	time(label: string = 'default'): void {
		if (this.timer[label]) {
			this.logger.warn(`Timer '${label}' already exists`);
		} else {
			this.timer[label] = Date.now();
		}
	}
	timeEnd(label: string = 'default'): void {
		this.timeLog(label);
		delete this.timer[label];
	}
	timeLog(label: string = 'default', ...data: any[]): void {
		if (this.timer[label]) {
			this.log('%s: %s ms', label, Date.now() - this.timer[label], ...data);
		} else {
			this.logger.warn(`Timer '${label}' does not exist`);
		}
	}

	profile(_label?: string): void {
		throw new Error('Method not implemented.');
	}
	profileEnd(_label?: string): void {
		throw new Error('Method not implemented.');
	}
	timeStamp(label: string = 'default'): void {
		this.logger.appendLine(label + ': ' + new Date().toLocaleString());
	}

	__revert() {
		global.console = oldConsole;
	}
}

let oldConsole = global.console;
export function replaceConsole(_logger: VSCodeChannelLogger = logger) {
	if (!(global.console instanceof WrapConsole)) {
		global.console = new WrapConsole(_logger);
	}
	return oldConsole;
}
