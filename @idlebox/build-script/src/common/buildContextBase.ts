import { IBuildContext, IMyProjectJson, IMyProjectJsonParsed, IPluginDefine } from '../global';

export abstract class BuildContextBase implements IBuildContext {
	public projectJson: IMyProjectJsonParsed;
	protected plugins?: IPluginDefine[];

	public readonly args: ReadonlyArray<string> = []; // handled by proxy

	protected constructor(
		protected readonly projectRoot: string,
	) {
		this.projectJson = {
			alias: new Map(),
			job: new Map(),
			scriptsJob: new Map(),
		};
	}

	registerAlias(name: string, command: string, args?: string[]) {
		if (this.projectJson.alias.has(name)) {
			throw new Error('job exists: ' + name);
		}
		if (args) {
			this.projectJson.alias.set(name, [command, ...args]);
		} else {
			this.projectJson.alias.set(name, command.trim());
		}
	}

	private getOrCreateCommand(cmd: string) {
		if (!this.projectJson.job.has(cmd)) {
			const run = new Set<string>();
			let _title = '';
			this.projectJson.job.set(cmd, {
				set title(v: string) {_title = v;},
				get title() {return _title || 'run: ' + Array.from(run).join(' ');},
				serial: false,
				after: new Set<string>(),
				preRun: new Set<string>(),
				postRun: new Set<string>(),
				run,
			});
		}
		return this.projectJson.job.get(cmd)!;
	}

	setRunMode(command: string, mod: 'serial' | 'parallel') {
		const cmd = this.getOrCreateCommand(command);
		cmd.serial = mod === 'serial';
	}

	prefixAction(command: string, jobs: string) {
		const cmd = this.getOrCreateCommand(command);
		for (const item of jobs) {
			cmd.preRun.add(item);
		}
	}

	addAction(command: string, jobs: string[], dependency?: string[]) {
		const cmd = this.getOrCreateCommand(command);
		for (const item of jobs) {
			cmd.run.add(item);
		}
		if (dependency) {
			for (const item of dependency) {
				cmd.after.add(item);
			}
		}
		return cmd;
	}

	postfixAction(command: string, jobs: string) {
		const cmd = this.getOrCreateCommand(command);
		for (const item of jobs) {
			cmd.postRun.add(item);
		}
	}

	toObject(): IMyProjectJson {
		const alias: IMyProjectJson['alias'] = {};
		for (const [k, v] of this.projectJson.alias.entries()) {
			alias[k] = v;
		}
		const command: IMyProjectJson['command'] = {};
		for (const [k, v] of this.projectJson.job.entries()) {
			command[k] = {
				title: v.title,
				run: [...v.run.values()],
			};
			if (v.after.size) {
				command[k].after = [...v.after.values()];
			}
		}
		return {
			load: this.plugins!,
			alias, command,
		};
	}
}
