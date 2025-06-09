import { colorMode, verboseMode } from './shared.js';

// TODO: replace logger with @idlebox/logger

export interface ILogger {
	get title(): string;
	error(msg: string): void;
	notice(msg: string): void;
	warn(msg: string): void;
	success(msg: string): void;
	info(msg: string): void;
	log(msg: string): void;
	debug(msg: string): void;
	verbose(msg: string): void;
	die(msg: string): void;
	wrap(label: string): ILogger;

	checked(msg: string): void;
	boom(msg: string): void;
}

const colorOutput = {
	error(label: string, msg: string) {
		colorLogLine(label, '9', msg);
	},
	success(label: string, msg: string) {
		colorLog(label, '10', msg);
	},
	info(label: string, msg: string) {
		colorLog(label, '14', msg);
	},
	notice(label: string, msg: string) {
		colorLogLine(label, '11', msg);
	},
	warn(label: string, msg: string) {
		colorLogLine(label, '11', msg);
	},
	log(label: string, msg: string) {
		monoLog(label, msg);
	},
	debug(label: string, msg: string) {
		colorLogLine(label, '8', msg);
	},
	verbose(label: string, msg: string) {
		colorLogLine(label, '8', msg);
	},

	checked(label: string, msg: string) {
		colorLogLine(label, '10', `✅✅✅ ${msg}`);
	},
	boom(label: string, msg: string) {
		colorLogLine(label, '9;1', `💥💥💥 ${msg}`);
	},
};

const monoOutput = {
	error(label: string, msg: string) {
		monoLog(`ERROR][${label}`, msg);
	},
	success(label: string, msg: string) {
		monoLog(`SUCCESS][${label}`, msg);
	},
	info(label: string, msg: string) {
		monoLog(`INFO][${label}`, msg);
	},
	notice(label: string, msg: string) {
		monoLog(`NOTICE][${label}`, msg);
	},
	warn(label: string, msg: string) {
		monoLog(`WARN][${label}`, msg);
	},
	log(label: string, msg: string) {
		monoLog(label, msg);
	},
	debug(label: string, msg: string) {
		monoLog(`DEBUG][${label}`, msg);
	},
	verbose(label: string, msg: string) {
		monoLog(`VERBOSE][${label}`, msg);
	},
	checked(label: string, msg: string) {
		monoLog(`SUCCESS][${label}`, `✅✅✅ ${msg}`);
	},
	boom(label: string, msg: string) {
		monoLog(`ERROR][${label}`, `💥💥💥 ${msg}`);
	},
};

const output = colorMode ? colorOutput : monoOutput;

if (!verboseMode) {
	output.debug = () => {};
	output.verbose = () => {};
}

function subLogger(label: string): ILogger {
	return {
		get title() {
			return label;
		},
		wrap(sub_label: string) {
			return subLogger(`${label}][${sub_label}`);
		},
		error: output.error.bind(output, label),
		success: output.success.bind(output, label),
		info: output.info.bind(output, label),
		log: output.log.bind(output, label),
		notice: output.notice.bind(output, label),
		warn: output.warn.bind(output, label),
		debug: output.debug.bind(output, label),
		verbose: output.verbose.bind(output, label),
		die: (message: string) => {
			colorLogLine(label, '9;1', message);
			process.exit(1);
		},

		checked: output.checked.bind(output, label),
		boom: output.boom.bind(output, label),
	};
}

export const Logger = Object.assign(subLogger, output);

function colorLog(label: string, color: string, msg: string) {
	console.log(`\x1b[38;5;${color}m[${label}]\x1b[0m ${msg}`);
}

function colorLogLine(label: string, color: string, msg: string) {
	console.log(`\x1b[38;5;${color}m[${label}] ${msg}\x1b[0m`);
}

function monoLog(label: string, msg: string) {
	console.log(`[${label}] ${msg}`);
}

export function die(msg: string): void {
	colorLogLine('die', '9;1', msg);
	process.exit(1);
}
