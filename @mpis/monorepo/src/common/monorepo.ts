import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { AsyncDisposable, Emitter, isWindows, PathArray, type IPackageJson } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/json-edit';
import { logger, type IMyLogger } from '@idlebox/logger';
import { getEnvironment, relativePath } from '@idlebox/node';
import { CompileError, ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import { currentCommand } from '../bin.js';
import { workspaceRoot } from './constants.js';

interface IPnpmListProject {
	name: string;
	version: string;
	path: string;
	private: boolean;
}
async function pnpmListWorkspace(): Promise<IPnpmListProject[]> {
	const result = await execa('pnpm', ['m', 'ls', '--json', '--depth=-1'], {
		cwd: workspaceRoot,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'inherit'],
	});

	return JSON.parse(result.stdout);
}

export interface IWorkspaceProject {
	readonly _id: string;
	readonly absolutePath: string;
	readonly relativePath: string;
	readonly packageJson: IPackageJson;
	readonly config: ProjectConfig;
	/** workspace本地依赖 */
	readonly workspaceDependencies: readonly string[];
}

function normalizeName(name: string) {
	return name.replace(/^@/, '').replace(/\//g, '-');
}

async function getWorkspaceProjects(logger: IMyLogger): Promise<readonly IWorkspaceProject[]> {
	const projects = await pnpmListWorkspace();
	logger.debug`Found ${projects.length} workspace projects`;
	logger.verbose`list<${projects.map((p) => p.name)}>`;
	const ps = projects.map(async (project) => {
		const packageJson = await loadJsonFile(resolve(project.path, 'package.json'));
		logger.debug` ==== package: ${packageJson.name} ====`;

		if (!packageJson.name) {
			logger.debug`package is empty`;
			return undefined;
		}

		const config = new ProjectConfig(project.path, undefined, logger);
		logger.debug`use rig package: ${config.rigConfig.rigFound}`;
		const dependencies = await mergeDependencies(packageJson);

		return {
			_id: project.name ? normalizeName(project.name) : '',
			absolutePath: project.path,
			relativePath: relativePath(workspaceRoot, project.path),
			packageJson: packageJson,
			workspaceDependencies: dependencies,
			config: config,
		} satisfies IWorkspaceProject;
	});
	const results = (await Promise.all(ps)).filter((p) => !!p);

	decoupleDependencies(logger, results);

	return results;
}

function mergeDependencies(packageJson: IPackageJson) {
	const dependencies = new Set<string>();
	if (packageJson.dependencies) {
		for (const [name, version] of Object.entries(packageJson.dependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.add(name);
			}
		}
	}
	if (packageJson.devDependencies) {
		for (const [name, version] of Object.entries(packageJson.devDependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.add(name);
			}
		}
	}

	return Array.from(dependencies);
}

type NotReadonly<T> = {
	-readonly [P in keyof T]: T[P];
};
type IGlobalRemoveMap = Map<string /* 目标包名 */, string[]>;

function decoupleDependencies(logger: IMyLogger, projects: readonly NotReadonly<IWorkspaceProject>[]) {
	const global_removes: IGlobalRemoveMap = new Map();
	const local_names = projects.map((p) => p.packageJson.name);
	for (const name of local_names) {
		global_removes.set(name, []);
	}
	global_removes.set('*', []);

	for (const { packageJson, absolutePath } of projects) {
		const add_if_not = (r: string) => {
			const exists = global_removes.get(r);
			if (!exists) {
				const pkgFile = resolve(absolutePath, 'package.json');
				throw logger.fatal`decoupledDependents in long<${pkgFile}> specified a package "${r}" that is not in workspace.`;
			}
			exists.push(packageJson.name);
		};

		if (Array.isArray(packageJson.decoupledDependents)) {
			for (const decouplePackage of packageJson.decoupledDependents) {
				add_if_not(decouplePackage);
			}
		} else if (packageJson.decoupledDependents === '*') {
			add_if_not('*');
		} else if (packageJson.decoupledDependents) {
			const pkgFile = resolve(absolutePath, 'package.json');
			logger.fatal`decoupledDependents in long<${pkgFile}> must be an array, or "*", got "${packageJson.decoupledDependents}"`;
		}
	}

	logger.verbose`decoupled dependencies list<${global_removes}>`;

	for (const project of projects) {
		decoupleDependenciesProject(
			logger,
			project,
			global_removes.get(project.packageJson.name) ?? [],
			global_removes.get('*') ?? [],
		);
		logger.verbose`workspace dependencies list<${project.workspaceDependencies}>`;
	}
}

function decoupleDependenciesProject(
	logger: IMyLogger,
	project: NotReadonly<IWorkspaceProject>,
	revert_removes: readonly string[],
	global_removes: readonly string[],
) {
	logger.debug`decouple: project ${project.packageJson.name} dependencies: ${project.workspaceDependencies.length}`;
	if (revert_removes.length === 0 && global_removes.length === 0 && !project.packageJson.decoupledDependencies) {
		logger.debug`decouple: nothing to do`;
		return;
	}
	const dependencies = new Set(project.workspaceDependencies);

	const removes = project.packageJson.decoupledDependencies ?? [];
	if (Array.isArray(removes)) {
		for (const remove of [...removes, ...revert_removes]) {
			if (!dependencies.has(remove)) {
				const pkgFile = resolve(project.absolutePath, 'package.json');
				logger.fatal`decoupled dependency "${remove}" in long<${pkgFile}> not exists (or not workspace:)`;
			}

			logger.verbose`decouple: delete dependency "${remove}" from ${project.packageJson.name}`;
			dependencies.delete(remove);
		}
		for (const remove of global_removes) {
			if (dependencies.has(remove)) {
				logger.verbose`decouple: delete dependency "${remove}" from ${project.packageJson.name}`;
				dependencies.delete(remove);
			}
		}
	} else if (typeof removes === 'string') {
		if (removes === '*') {
			logger.verbose`decouple: force delete all dependencies from ${project.packageJson.name}`;
			dependencies.clear();
		} else {
			const pkgFile = resolve(project.absolutePath, 'package.json');
			logger.fatal`decoupledDependencies in long<${pkgFile}> must be an array, or "*", got "${removes}"`;
		}
	} else {
		const pkgFile = resolve(project.absolutePath, 'package.json');
		logger.fatal`decoupledDependencies in long<${pkgFile}> must be an array, got ${typeof removes}`;
	}

	project.workspaceDependencies = Array.from(dependencies);
	logger.debug`decouple: finished: ${project.workspaceDependencies.length} remains`;
}

export async function createMonorepoObject() {
	const local_logger = logger.extend('monorepo');
	const projects = await getWorkspaceProjects(local_logger);
	const repo = new PnpmMonoRepo(local_logger, projects);

	return repo;
}

export type IPnpmMonoRepo = PnpmMonoRepo;

class PnpmMonoRepo extends AsyncDisposable {
	private readonly workersManager: WorkersManager;
	private readonly pathvar: PathArray;
	private readonly errorMessages = new Map<IWorkspaceProject, string>();

	private readonly _onStateChange = this._register(new Emitter<void>());
	public readonly onStateChange = this._onStateChange.event;

	constructor(
		public readonly logger: IMyLogger,
		protected readonly projects: readonly IWorkspaceProject[],
	) {
		super('PnpmMonoRepo');

		const pathVar = getEnvironment(isWindows ? 'Path' : 'PATH').value;
		if (!pathVar) {
			throw new Error('PATH environment variable is not set');
		}
		this.pathvar = new PathArray(pathVar);
		this.pathvar.add(dirname(process.execPath), true, true);

		const watchMode = currentCommand === 'watch';
		this.workersManager = new WorkersManager(watchMode ? ModeKind.Watch : ModeKind.Build, logger);
		this.workersManager._register(this);

		for (const project of projects) {
			const exec = this.makeExecuter(watchMode, project);
			if (exec) {
				this.workersManager.addWorker(exec, project.workspaceDependencies);
			} else {
				this.workersManager.addEmptyWorker(project.packageJson.name);
			}
		}
	}

	async _finalize() {
		this.workersManager.finalize();
	}

	async startup() {
		this.workersManager.finalize();
		// this.dump();
		await this.workersManager.startup();
	}

	private makeExecuter(watchMode: boolean, project: IWorkspaceProject): undefined | ProcessIPCClient {
		if (project.packageJson.scripts?.watch === undefined) {
			this.logger
				.fatal`project ${project.packageJson.name} does not have a "watch" script. If it doesn't need, specify a empty string.`;
		}
		if (project.packageJson.scripts?.build === undefined) {
			this.logger
				.fatal`project ${project.packageJson.name} does not have a "build" script. If it doesn't need, specify a empty string.`;
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
		const logger = this.logger.extend(project._id);

		const env: Record<string, string> = {};
		env[isWindows ? 'Path' : 'PATH'] = this.forkPath(project).toString();

		const exec = new ProcessIPCClient(project.packageJson.name, cmds, project.absolutePath, env, logger); // TODO: env add Path
		exec.displayTitle = cmds[0];

		exec.onFailure((e) => {
			if (e instanceof CompileError) {
				this.errorMessages.set(project, e.message + '\n' + (e.output ?? 'no output from process'));
			} else {
				this.errorMessages.set(project, e.stack || e.message);
			}
			this._onStateChange.fireNoError();
		});
		exec.onSuccess(() => {
			this._onStateChange.fireNoError();
		});
		exec.onStart(() => {
			this.errorMessages.delete(project);
			this._onStateChange.fireNoError();
		});
		exec.onTerminate(() => {
			this._onStateChange.fireNoError();
		});
		return exec;
	}

	formatErrors() {
		if (this.errorMessages.size === 0) return '';
		let output = '';

		const flush_line = ' '.repeat(process.stderr.columns || 80);
		for (const [project, text] of this.errorMessages.entries()) {
			output += `\n\x1B[48;5;1m${flush_line}\r    \x1B[0;38;5;9;1m  below is output of ${project.packageJson.name}  \x1B[0m\n`;
			output += text;
			output += `\x1B[48;5;1m${flush_line}\r    \x1B[0;38;5;9;1m  ending output of ${project.packageJson.name}  \x1B[0m\n`;
		}
		return output;
	}

	private forkPath(info: IWorkspaceProject) {
		const pathvar = this.pathvar.clone();

		if (info.config.rigConfig.rigFound) {
			const rig_nm = resolve(info.config.rigConfig.getResolvedProfileFolder(), '../../node_modules/.bin');
			pathvar.add(rig_nm, true, true);
			this.logger.debug`[path:rig] using rig bindir: long<${rig_nm}>`;
		} else {
			this.logger.debug`[path:rig] using rig bindir: no`;
		}

		pathvar.add(resolve(info.absolutePath, 'node_modules/.bin'), true, true);

		return pathvar;
	}

	dump(asList = true) {
		if (asList) {
			return this.workersManager.formatDebugList();
		} else {
			return this.workersManager.formatDebugGraph();
		}
	}

	printScreen() {
		let r = this.formatErrors();
		r += this.dump();
		console.error(r);
	}
}
