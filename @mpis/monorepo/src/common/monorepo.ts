import { ProjectConfig, ValidationError } from '@build-script/rushstack-config-loader';
import { isWindows, PathArray, type IPackageJson } from '@idlebox/common';
import { loadJsonFile, readCommentJsonFileSync } from '@idlebox/json-edit';
import { logger, type IMyLogger } from '@idlebox/logger';
import { getEnvironment, relativePath } from '@idlebox/node';
import { ModeKind, ProcessIPCClient, WorkersManager } from '@mpis/server';
import { execa } from 'execa';
import { dirname, resolve } from 'node:path';
import { split as splitCmd } from 'split-cmd';
import { currentCommand } from '../bin.js';
import type { IBuildConfigJson } from './monorepo.json.js';
import { selfRootDir, workspaceRoot } from './constants.js';

const schemas = {
	build: readCommentJsonFileSync(resolve(selfRootDir, 'monorepo.schema.json')),
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

		const config = new ProjectConfig(project.path, undefined, logger.error);
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
	let dependencies: string[] = [];

	try {
		const overrides = config.loadPackageJsonOnly<IBuildConfigJson>('build', schemas.build);
		logger.debug`using override file ${absolutePath}/config/monorepo.json`;
		if (overrides.dependencies) {
			dependencies.push(...overrides.dependencies);

			for (const name of dependencies) {
				if (
					!packageJson.dependencies?.[name].startsWith('workspace:') ||
					!packageJson.devDependencies?.[name].startsWith('workspace:')
				) {
					logger.fatal(
						`dependency "${name}" in override file must specified in package.json with version "workspace:"`,
					);
				}
			}

			return dependencies;
		}
	} catch (error: any) {
		if (error instanceof ValidationError) {
			logger.fatal(error.message);
		}
		logger.debug`monorepo.json: ${error.name} long<${error.message}>`;
	}

	if (packageJson.dependencies) {
		for (const [name, version] of Object.entries(packageJson.dependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.push(name);
			}
		}
	}
	if (packageJson.devDependencies) {
		for (const [name, version] of Object.entries(packageJson.devDependencies)) {
			if (version.startsWith('workspace:')) {
				dependencies.push(name);
			}
		}
	}
	logger.verbose`workspace dependencies list<${dependencies}>`;

	return dependencies;
}

export async function createMonorepoObject() {
	const local_logger = logger.extend('monorepo');
	const projects = await getWorkspaceProjects(local_logger);
	return new PnpmMonoRepo(local_logger, projects);
}

class PnpmMonoRepo {
	private readonly workersManager: WorkersManager;
	private readonly pathvar: PathArray;

	constructor(
		public readonly logger: IMyLogger,
		protected readonly projects: readonly IWorkspaceProject[],
	) {
		const pathVar = getEnvironment(isWindows ? 'Path' : 'PATH').value;
		if (!pathVar) {
			throw new Error('PATH environment variable is not set');
		}
		this.pathvar = new PathArray(pathVar);
		this.pathvar.add(dirname(process.execPath), true, true);

		const watchMode = currentCommand === 'watch';
		this.workersManager = new WorkersManager(watchMode ? ModeKind.Watch : ModeKind.Build, logger);

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

		return new ProcessIPCClient(project.packageJson.name, cmds, project.absolutePath, env, logger); // TODO: env add Path
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
		console.error('%s\n', this.workersManager.formatDebugGraph());
	}
}
