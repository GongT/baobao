import { dirname, resolve } from 'path';
import { existsSync, findUpUntilSync } from '@idlebox/node';
import { getFormatInfo, loadJsonFile, loadJsonFileSync, reformatJson, writeJsonFile } from '@idlebox/node-json-edit';
import { IMyProjectJson, rectLoadDefine } from '../global';
import { createGulpFile } from './buildContext.createGulpFile';
import { BuildContextBase } from './buildContextBase';
import { isArrayOfString } from './func';
import { loadPlugin, resetLoader } from './pluginLoader';

export interface MapLike<T> {
	[key: string]: T;
}
export class BuildContext extends BuildContextBase {
	private rawProjectJson?: IMyProjectJson;
	private configFilePath: string;

	public constructor(public readonly projectRoot: string, creating: boolean = false) {
		const configFile = findUpUntilSync(projectRoot, 'build-script.json');
		if (configFile) {
			projectRoot = dirname(configFile);
		}

		super(projectRoot);

		if (configFile) {
			this.configFilePath = configFile;
		} else {
			this.configFilePath = resolve(projectRoot, 'build-script.json');
		}

		if (!creating) {
			this._init();
		}
	}

	readProjectJson() {
		if (!this.rawProjectJson) {
			if (!this.isProjectJsonExists()) {
				console.error('Usage: build-script [command to run].');
				console.error(
					'  Error: this command must run inside a project folder (contains a "build-script.json" file).'
				);
				console.error('  or use \x1B[38;5;14mbuild-script init\x1B[0m to create this file in current folder.');
				process.exit(1);
			}
			this.rawProjectJson = loadJsonFileSync(this.configFilePath);

			createGulpFile(this);
		}
		return this.rawProjectJson!;
	}

	isProjectJsonExists() {
		return existsSync(this.configFilePath);
	}

	/** @internal */
	private _init() {
		const projectJson = this.readProjectJson();

		const packageJson = require(resolve(this.projectRoot, 'package.json'));
		for (const [name, script] of Object.entries(packageJson.scripts as MapLike<string>)) {
			if (!script.startsWith('build-script')) {
				this.projectJson.scriptsJob.set(name, script);
			}
		}

		for (const [name, cmd] of Object.entries(projectJson.alias || {})) {
			if (typeof cmd !== 'string' && !isArrayOfString(cmd)) {
				throw new Error(`alias COMMAND only allow string | string[], key is: ${name}`);
			}
			if (Array.isArray(cmd)) {
				this.registerAlias(name, cmd[0], cmd.slice(1));
			} else {
				this.registerAlias(name, cmd);
			}
		}

		for (const [name, def] of Object.entries(projectJson.command || {})) {
			if (!def || typeof def !== 'object') {
				throw new Error(`command DEFINE not valid, key is: ${name}`);
			}
			let { title, after, run, serial } = def;
			if (!isArrayOfString(run)) {
				throw new Error(`command RUN must string[], key is: ${name}`);
			}
			if (after && !isArrayOfString(after)) {
				throw new Error(`command AFTER must string[], key is: ${name}`);
			}

			const work = this.addAction(name, run, after);
			if (title) {
				work.title = title;
			}

			if (serial) {
				work.serial = true;
			}
		}

		this.plugins = rectLoadDefine(projectJson.load || []);
	}

	loadPlugins() {
		resetLoader();
		this.pluginMode = true;
		for (const { file, args } of this.plugins!) {
			loadPlugin(file, args);
		}
		this.pluginMode = false;
	}

	public async writeBack() {
		const packageJson = await loadJsonFile(resolve(this.projectRoot, 'package.json'));
		const data = reformatJson(this.toObject(), getFormatInfo(packageJson) || {});
		await writeJsonFile(this.configFilePath, data);
	}

	pushPlugin(file: string, args: string[]) {
		const alreadyExists = this.plugins!.find((item) => {
			return item.file === file;
		});
		if (alreadyExists) {
			alreadyExists.args = args;
		} else {
			this.plugins!.push({ file, args });
		}
	}

	public getPlugin(file: string): string[] | void {
		const alreadyExists = this.plugins!.find((item) => {
			return item.file === file;
		});
		if (alreadyExists) {
			return alreadyExists.args;
		}
	}
}
