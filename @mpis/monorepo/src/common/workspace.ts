import { createWorkspace, type IPackageInfo, type MonorepoWorkspace } from '@build-script/monorepo-lib';
import { DisposedError, Emitter, EnhancedAsyncDisposable, isWindows, PathArray } from '@idlebox/common';
import { CSI, logger, type IMyLogger } from '@idlebox/logger';
import { getEnvironment, workingDirectory } from '@idlebox/node';
import { CompileError, ModeKind, ProcessIPCClient, WorkerClientState, WorkersManager } from '@mpis/server';
import { RigConfig, type IRigConfig } from '@rushstack/rig-package';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import { currentCommand } from '../bin.js';
import { StringCollect } from './string-collect.js';

interface IOptions {
	readonly debugChildren?: boolean;
}

export async function createMonorepoObject(options?: IOptions) {
	const workspace = await createWorkspace();
	logger.debug`workspace: long<${workspace.root}>`;
	const repo = new PnpmMonoRepo(logger, workspace);
	await repo.initialize(options);
	return repo;
}

export type IPnpmMonoRepo = PnpmMonoRepo;
const colorReg = /\x1B\[[0-9;]+?m/g;
const unclosedColorReg = /\x1B\[[^m]*$/g;

interface IDumpOptions {
	readonly depth?: number;
	readonly summary?: boolean;
	readonly short?: boolean;
	readonly reverse?: boolean;
}

const firstEmptyLine = /^\s*\n/;
class PnpmMonoRepo extends EnhancedAsyncDisposable {
	public readonly workersManager: WorkersManager;
	private readonly pathvar: PathArray;
	private readonly errorMessages = new Map<IPackageInfo, string>();
	private readonly debugOutputs = new StringCollect<IPackageInfo>();
	private readonly rigConfig = new Map<IPackageInfo, IRigConfig>(); // TODO: 太重了

	private readonly _onStateChange = this._register(new Emitter<IPackageInfo>());
	public readonly onStateChange = this._onStateChange.event;

	private readonly mode: ModeKind;
	private readonly packageToWorker = new Map<IPackageInfo, ProcessIPCClient>();

	constructor(
		public readonly logger: IMyLogger,
		public readonly workspace: MonorepoWorkspace,
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

	async initialize({ debugChildren = false }: IOptions = {}) {
		await this.workspace.decoupleDependencies();
		const projects = await this.workspace.listPackages();
		logger.debug`workspace: ${projects.length} packages.`;
		for (const project of projects) {
			if (!project.packageJson.name) continue;

			const addEnvs: Record<string, string> = {};
			if (debugChildren) {
				addEnvs['DEBUG_LEVEL'] = 'verbose';
				addEnvs['DEBUG'] = '* -executer:* -dispose:*';
			}

			const exec = this.makeExecuter(this.mode === ModeKind.Watch, project, addEnvs);
			if (exec) {
				const all_deps = new Set<string>([...project.devDependencies, ...project.dependencies]);
				this.workersManager.addWorker(exec, Array.from(all_deps));
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
		this._register(graph);
		await graph.startup();
	}

	private makeExecuter(watchMode: boolean, project: IPackageInfo, addEnvs: Record<string, string> = {}): undefined | ProcessIPCClient {
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

		const env: Record<string, string> = { ...addEnvs };
		env[isWindows ? 'Path' : 'PATH'] = this.forkPath(project).toString();

		const exec = new ProcessIPCClient(project.packageJson.name, cmds, project.absolute, env, logger); // TODO: env add Path
		if (cmds[0] !== 'mpis-run') {
			exec.displayTitle += `[${cmds[0]}]`;
		}

		exec.onFailure((e) => {
			const output = (e as CompileError).output ?? '## onFailure: no output from process ##';
			this.debugOutputs.append(project, output);
			if (e instanceof CompileError) {
				this.errorMessages.set(project, `${e.message}\n${output}`);
			} else {
				this.errorMessages.set(project, e.stack || e.message);
			}
			this._onStateChange.fireNoError(project);
		});
		exec.onSuccess((e) => {
			const output = e.output ?? '## onSuccess: no output from process ##';
			this.debugOutputs.append(project, output);

			this.errorMessages.delete(project);
			this._onStateChange.fireNoError(project);
		});
		exec.onStart(() => {
			this.debugOutputs.clear(project);
			this.errorMessages.delete(project);
			this._onStateChange.fireNoError(project);
		});
		exec.onTerminate(() => {
			this.debugOutputs.append(project, '## onTerminate: process terminated ##');
			try {
				this._onStateChange.fireNoError(project);
			} catch (e) {
				if (e instanceof DisposedError) {
					// 不知道这里是不是真的需要触发 onStateChange
					return;
				}
				throw e;
			}
		});

		this.packageToWorker.set(project, exec);

		return exec;
	}

	hasWorkerFailed() {
		return this.packageToWorker.values().some((item) => !item.isSuccess);
	}

	hasWorkerNotComplete() {
		return this.packageToWorker.values().some((item) => {
			const state = item.state;
			return state !== WorkerClientState.COMPILE_SUCCEED && state !== WorkerClientState.COMPILE_FAILED;
		});
	}

	/**
	 * @internal
	 */
	_debugWorker(project: IPackageInfo) {
		return this.packageToWorker.get(project);
	}

	/**
	 * @internal
	 */
	_debugGetOutput(project: IPackageInfo): string | undefined {
		const worker = this.packageToWorker.get(project);
		return worker?.outputStream.toString();
	}

	getErrors(): ReadonlyMap<IPackageInfo, string> {
		return this.errorMessages;
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
			const block = text.replace(firstEmptyLine, '').trimEnd();
			// biome-ignore lint/style/noNonNullAssertion: no error if no worker
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

	getProgress(includeFailed = true) {
		const count = this.packageToWorker.size;
		const completed = this.packageToWorker
			.values()
			.filter((item) => {
				const state = item.state;
				return state === WorkerClientState.COMPILE_SUCCEED || (includeFailed && state === WorkerClientState.COMPILE_FAILED);
			})
			.toArray().length;
		return Math.floor((100 * completed) / count);
	}

	dump({ depth = 0, short = false, summary = true, reverse = false }: IDumpOptions = {}) {
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
				if (summary) result.push(graph.debugFormatSummary());
				return result.join('\n');
			} else {
				graphTxt = graph.debugFormatList();
			}
		} else {
			graphTxt = graph.debugFormatGraph(depth, reverse);
		}
		if (!summary) return graphTxt;

		return `${graphTxt}\n${graph.debugFormatSummary()}`;
	}

	printScreen(short = false, listAbove = false) {
		let r = this.formatErrors();
		if (listAbove) {
			r = this.dump({ short }) + r;
		} else {
			r += this.dump({ short });
		}
		console.error(r);
	}
}
