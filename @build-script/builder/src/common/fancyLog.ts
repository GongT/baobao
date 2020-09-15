import log from 'fancy-log';

export interface Logger {
	(...args: any[]): Logger;
	debug(...args: any[]): Logger;
	dir(...args: any[]): Logger;
	error(...args: any[]): Logger;
	info(...args: any[]): Logger;
	warn(...args: any[]): Logger;
}

const enabled = (process.env.NODE_DEBUG || '').includes('build-script');

const logger: Logger = log as Logger;
Object.assign(log, {
	debug: (...args: any[]): Logger => {
		if (enabled) {
			if (typeof args[0] === 'string') {
				console.error('[build-script] ' + args[0], ...args.slice(1));
			} else {
				console.error('[build-script]', ...args);
			}
			fancyLog(...args);
		}
		return logger;
	},
});

export const fancyLog = logger;
