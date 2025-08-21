import { createWorkspace, type IPackageInfo, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { AsyncDisposable, Disposed, Emitter, isWindows, PathArray } from '@idlebox/common';
import { CSI, logger, type IMyLogger } from '@idlebox/logger';
import { getEnvironment, workingDirectory } from '@idlebox/node';
import { CompileError, ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { RigConfig, type IRigConfig } from '@rushstack/rig-package';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import { currentCommand } from './args.js';

export async function createMonorepoObject() {
	const workspace = await createWorkspace();
	logger.debug`workspace: long<${workspace.root}>`;
	const repo = new PnpmMonoRepo(logger, workspace);
	await repo.initialize();
	return repo;
}

export type IPnpmMonoRepo = PnpmMonoRepo;
const colorReg = /\x1B\[[0-9;]+?m/g;
const unclosedColorReg = /\x1B\[[^m]*$/g;

class PnpmMonoRepo extends AsyncDisposable {
	private readonly workersManager: WorkersManager;
	private readonly pathvar: PathArray;
	private readonly errorMessages = new Map<IPackageInfo, string>();
	private readonly rigConfig = new Map<IPackageInfo, IRigConfig>(); // TODO: 太重了

	private readonly _onStateChange = this._register(new Emitter<void>());
	public readonly onStateChange = this._onStateChange.event;

	private readonly mode: ModeKind;
	private readonly packageToWorker = new Map<IPackageInfo, ProcessIPCClient>();

	constructor(
		public readonly logger: IMyLogger,
		protected readonly workspace: MonorepoWorkspace,
	) {
		super('PnpmMonoRepo');

		const pathVar = getEnvironment(isWindows ? 'Path' : 'PATH').value;
		if (!pathVar) {
			throw new Error('PATH environment variable is not set');
		}
		this.pathvar = new PathArray(pathVar);
		this.pathvar.add(dirname(process.execPath), true, true);

		this.mode = currentCommand === 'watch' ? ModeKind.Watch : ModeKind.Build;
		this.workersManager = new WorkersManager(this.mode, logger);
	}

	async initialize() {
		await this.workspace.decoupleDependencies();
		const projects = await this.workspace.listPackages();
		logger.debug`workspace: ${projects.length} packages.`;
		for (const project of projects) {
			if (!project.packageJson.name) continue;

			const exec = this.makeExecuter(this.mode === ModeKind.Watch, project);
			if (exec) {
				this.workersManager.addWorker(exec, project.devDependencies);
			} else {
				this.workersManager.addEmptyNode(project.packageJson.name);
			}
		}
	}

	async _finalize() {
		this.workersManager.finalize();
	}

	async startup() {
		const graph = this.workersManager.finalize();
		// this.dump();
		graph._register(this);
		await graph.startup();
	}

	private makeExecuter(watchMode: boolean, project: IPackageInfo): undefined | ProcessIPCClient {
		if (project.packageJson.scripts?.watch === undefined) {
			this.logger.fatal`project ${project.packageJson.name} does not have a "watch" script. If it doesn't need, specify a empty string.`;
		}
		if (project.packageJson.scripts?.build === undefined) {
			this.logger.fatal`project ${project.packageJson.name} does not have a "build" script. If it doesn't need, specify a empty string.`;
		}
		const script = watchMode ? project.packageJson.scripts.watch : project.packageJson.scripts.build;

		if (script === '') {
			this.logger.verbose`skip project "${project.packageJson.name}" with a empty script.`;
			return undefined;
		}

		const cmds = splitCmd(script);
		if (!cmds.length) {
			this.logger.fatal`project ${project.packageJson.name} script "${script}" is invalid.`;
		}
		const logger = this.logger.extend(project.name);

		const env: Record<string, string> = {};
		env[isWindows ? 'Path' : 'PATH'] = this.forkPath(project).toString();

		const exec = new ProcessIPCClient(project.packageJson.name, cmds, project.absolute, env, logger); // TODO: env add Path
		exec.displayTitle = cmds[0];

		exec.onFailure((e) => {
			if (e instanceof CompileError) {
				this.errorMessages.set(project, `${e.message}\n${e.output ?? 'no output from process'}`);
			} else {
				this.errorMessages.set(project, e.stack || e.message);
			}
			this._onStateChange.fireNoError();
		});
		exec.onSuccess(() => {
			this.errorMessages.delete(project);
			this._onStateChange.fireNoError();
		});
		exec.onStart(() => {
			this.errorMessages.delete(project);
			this._onStateChange.fireNoError();
		});
		exec.onTerminate(() => {
			try {
				this._onStateChange.fireNoError();
			} catch (e) {
				if (e instanceof Disposed) {
					// 不知道这里是不是真的需要触发 onStateChange
					return;
				}
				throw e;
			}
		});

		this.packageToWorker.set(project, exec);

		return exec;
	}

	formatErrors() {
		if (this.errorMessages.size === 0) return '';
		let output = '';

		const lWidth = process.stderr.columns || 80;

		const barC = '48;5;185';
		const textC = '38;5;13';

		function buildLine(txt: string) {
			let psize = 4 + 2 + txt.replace(colorReg, '').length + 2;
			if (psize >= lWidth) {
				txt = txt.slice(Math.max(lWidth - 20), 20).replace(unclosedColorReg, '');
				psize = 4 + 2 + txt.replace(colorReg, '').length + 2;
			}
			return `\n${CSI}${barC}m    ${CSI}0;${textC}m  ${txt}  ${CSI}0${barC}m${' '.repeat(lWidth - psize)}${CSI}0m\n`;
		}

		for (const [project, text] of this.errorMessages.entries()) {
			const block = text.replace(/^\s*\n/, '').trimEnd();
			const exec = this.packageToWorker.get(project)!;
			output += buildLine(`[@mpis/monorepo] below is output in project ${CSI}38;5;14m${project.packageJson.name}${CSI}0;${textC}m: ${exec.commandline.join(' ')}`);
			output += workingDirectory.escapeVscodeCwd(project.absolute);
			output += `\nwd: ${project.absolute}\n${block}\n`.replace('\x1bc', '').replace(/^/gm, `${CSI}${barC}m ${CSI}0m `);
			output += buildLine(`[@mpis/monorepo] ending output in project ${CSI}38;5;14m${project.packageJson.name}${CSI}0;${textC}m`);
		}
		if (output) {
			output += workingDirectory.escapeVscodeCwd(process.cwd());
		}
		return output;
	}

	private getRig(project: IPackageInfo) {
		const exists = this.rigConfig.get(project);
		if (exists) {
			return exists;
		}

		const rig = RigConfig.loadForProjectFolder({ projectFolderPath: project.absolute });
		this.rigConfig.set(project, rig);
		return rig;
	}

	private forkPath(info: IPackageInfo) {
		const pathvar = this.pathvar.clone();

		const rig = this.getRig(info);
		if (rig.rigFound) {
			const rig_nm = resolve(rig.getResolvedProfileFolder(), '../../node_modules/.bin');
			pathvar.add(rig_nm, true, true);
			this.logger.debug`[path:rig] using rig bindir: long<${rig_nm}>`;
		} else {
			this.logger.debug`[path:rig] using rig bindir: no`;
		}

		pathvar.add(resolve(info.absolute, 'node_modules/.bin'), true, true);

		return pathvar;
	}

	dump(depth: number = 0, short = false) {
		const graph = this.workersManager.finalize();
		let graphTxt: string;
		if (depth <= 0) {
			if (short) {
				const result = [];
				for (const name of graph.overallOrder) {
					const node = graph.getNodeByName(name);
					if (node.isBlocking()) {
						result.push(node.customInspect());
					}
				}
				result.push(graph.debugFormatSummary());
				return result.join('\n');
			} else {
				graphTxt = graph.debugFormatList();
			}
		} else {
			graphTxt = graph.debugFormatGraph(depth);
		}
		return graphTxt + '\n' + graph.debugFormatSummary();
	}

	printScreen(short = false) {
		let r = this.formatErrors();
		r += this.dump(0, short);
		console.error(r);
	}
}
