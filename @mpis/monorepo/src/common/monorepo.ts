import { ProjectConfig, ValidationError } from '@build-script/rushstack-config-loader';
import { AsyncDisposable, Emitter, isWindows, PathArray, type IPackageJson } from '@idlebox/common';
import { loadJsonFile } from '@idlebox/json-edit';
import { logger, type IMyLogger } from '@idlebox/logger';
import { getEnvironment, relativePath } from '@idlebox/node';
import { CompileError, ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import { currentCommand } from '../bin.js';
import { selfRootDir, workspaceRoot } from './constants.js';
import type { IBuildConfigJson } from './monorepo.json.js';

const schemas = {
	build: resolve(selfRootDir, 'monorepo.schema.json'),
} as const;

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
		const dependencies = await filterWorkspaceDependencies(config, logger, project.path, packageJson);

		return {
			_id: project.name ? normalizeName(project.name) : '',
			absolutePath: project.path,
			relativePath: relativePath(workspaceRoot, project.path),
			packageJson: packageJson,
			workspaceDependencies: dependencies,
			config: config,
		} satisfies IWorkspaceProject;
	});
	const result = await Promise.all(ps);
	return result.filter((p) => !!p);
}

async function filterWorkspaceDependencies(
	config: ProjectConfig,
	logger: IMyLogger,
	absolutePath: string,
	packageJson: IPackageJson,
): Promise<string[]> {
	const removes: string[] = [];

	try {
		const overrides = config.loadPackageJsonOnly<IBuildConfigJson>('monorepo', schemas.build);
		logger.debug`using override file ${absolutePath}/config/monorepo.json`;

		if (overrides.dependencies && overrides.removeDependencies) {
			logger.fatal`${absolutePath}/config/monorepo.json: cannot use both "dependencies" and "removeDependencies" at the same time.`;
		}

		if (overrides.dependencies) {
			const dependencies: string[] = [];
			dependencies.push(...overrides.dependencies);

			for (const name of dependencies) {
				const depVer = packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name];
				if (!depVer || !depVer.startsWith('workspace:')) {
					logger.fatal(
						`dependency "${name}"(${depVer}) in "${absolutePath}/config/monorepo.json" must specified in package.json with version "workspace:"`,
					);
				}
			}

			return dependencies;
		}
		if (overrides.removeDependencies?.length) {
			removes.push(...overrides.removeDependencies);
		}
	} catch (error: any) {
		if (error instanceof ValidationError) {
			logger.fatal(error.message);
		}
		logger.debug`monorepo.json: ${error.name} long<${error.message}>`;
		if (error.code !== 'ENOENT') {
			throw error;
		}
	}

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

	for (const remove of removes) {
		if (!dependencies.has(remove)) {
			logger.fatal`dependency "${remove}" in "${absolutePath}/config/monorepo.json" not found in package.json`;
		}
		dependencies.delete(remove);
	}

	logger.verbose`workspace dependencies list<${dependencies}>`;

	return Array.from(dependencies);
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

	dump() {
		return this.workersManager.formatDebugList();
	}

	printScreen() {
		let r = this.formatErrors();
		r += this.dump();
		console.error(r);
	}

	override async dispose(): Promise<void> {
		await super.dispose();
		this.printScreen();
	}
}
