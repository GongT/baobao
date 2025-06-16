import { Emitter, sleep } from '@idlebox/common';
import { inspect } from 'node:util';
import { BuilderDependencyGraph, type IWatchEvents } from './watcher.js';

class WatchProgram implements IWatchEvents {
	public readonly _onSuccess = new Emitter<void>();
	public readonly onSuccess = this._onSuccess.event;

	public readonly _onFailed = new Emitter<Error>();
	public readonly onFailed = this._onFailed.event;

	public readonly _onRunning = new Emitter<void>();
	public readonly onRunning = this._onRunning.event;

	constructor(public readonly name: string) {}

	async execute(): Promise<void> {
		console.error(`[${this.name}] Executing...`);

		sleep(500);
		this._onSuccess.fire();
	}

	[inspect.custom]() {
		return `\x1B[2;3m[WatchProgram ${this.name}]\x1B[0m`;
	}
}

class ProgramStorage {
	private readonly programs: Record<string, WatchProgram> = {};

	new(name: string): WatchProgram {
		const p = new WatchProgram(name);
		this.programs[name] = p;
		return p;
	}

	get(name: string): undefined | WatchProgram {
		return this.programs[name];
	}

	each() {
		return Object.values(this.programs);
	}
}

const dep = new BuilderDependencyGraph();

const programs = new ProgramStorage();
dep.addNode('aaa', ['bbb', 'ccc'], programs.new('aaa'));
dep.addNode('bbb', ['ddd'], programs.new('bbb'));
dep.addNode('ccc', ['ddd'], programs.new('ccc'));
dep.addNode('ddd', [], programs.new('ddd'));

dep.finalize();

async function main() {
	console.error(dep);

	await dep.startup().catch((e) => {
		console.log('============== process quit with failed state ==============');
		throw e;
	});
	console.log('============== process quit completed ==============');

	console.error(dep);
}

+main();
