import type { IPackageJson } from '@idlebox/common';
import { StateEvent, type IOutputProcessor } from './program.js';

type Tester = (line: string) => boolean;

interface ISignals {
	readonly start: RegExp | Tester;
	readonly stop: RegExp | Tester;
	readonly failed: RegExp | Tester;
}

export function createSingleLineMatch(signals: ISignals): IOutputProcessor {
	const start = signals.start instanceof RegExp ? compile(signals.start) : signals.start;
	const stop = signals.stop instanceof RegExp ? compile(signals.stop) : signals.stop;
	const failed = signals.failed instanceof RegExp ? compile(signals.failed) : signals.failed;

	return (line: string) => {
		if (start(line)) {
			return StateEvent.StartBuild;
		}

		if (failed(line)) {
			return StateEvent.StopFail;
		}
		if (stop(line)) {
			return StateEvent.StopSuccess;
		}
		return StateEvent.Nothing;
	};
}

function compile(reg: RegExp): Tester {
	return (line: string) => reg.test(line);
}

export function checkTypescriptCompilerOutput(line: string) {
	let r;
	if (/Starting (incremental )?compilation/.test(line)) {
		return StateEvent.StartBuild;
	}
	if ((r = /Found (\d+) errors?\. Watching for file changes/.exec(line))) {
		if (r[1] === '0') {
			return StateEvent.StopSuccess;
		}
		return StateEvent.StopFail;
	}
	return StateEvent.Nothing;
}

export function makeOutputTester(pkgJson: IPackageJson) {
	const command = pkgJson.scripts.watch;
	if (command.includes('tsc ')) {
		return checkTypescriptCompilerOutput;
	}
	if (command.includes('heft ')) {
		return createSingleLineMatch({
			start: /---- generate started ----/,
			stop: /---- Finished \(\d/,
			failed: /---- Failed \(\d/,
		});
	}
	if (command.startsWith('local-esbuild ')) {
		return createSingleLineMatch({
			start: /\[esbuild\] build started/,
			stop: /\[esbuild\] build finished: success/,
			failed: /\[esbuild\] build finished: fail/,
		});
	}
	// TODO: load scripts from local project and rig
	throw new Error(`项目 ${pkgJson.name} 使用了不支持的命令: ${command}`);
}
