import { getFormatInfo, loadJsonFile, loadJsonFileSync, reformatJson, writeJsonFile } from '@idlebox/node-json-edit';
import { existsSync } from 'fs-extra';
import { resolve } from 'path';
import { loadPlugin, resetLoader } from '../api/loader';
import { IMyProjectJson, rectLoadDefine } from '../global';
import { BuildContextBase } from './buildContextBase';
import { fancyLog } from './fancyLog';
import { isArrayOfString } from './func';

export class BuildContext extends BuildContextBase {
	public readonly configFilePath: string;
	public readonly packageJsonPath: string;

	private rawProjectJson?: IMyProjectJson;
	private ppj?: Promise<any>;

	public constructor(public readonly projectRoot: string) {
		super(projectRoot);

		this.configFilePath = resolve(projectRoot, 'build-script.json');
		this.packageJsonPath = resolve(projectRoot, 'package.json');
	}

	readPackageJson() {
		if (!this.ppj) {
			if (!existsSync(this.packageJsonPath)) {
				console.error('Error: missing package.json.');
				process.exit(1);
			}

			fancyLog.info('Using package: %s', this.packageJsonPath);
			this.ppj = loadJsonFile(this.packageJsonPath);
		}
		return this.ppj;
	}

	readProjectJson() {
		if (!this.rawProjectJson) {
			if (!this.isProjectJsonExists()) {
				console.error('Usage: build-script [command to run].');
				console.error('  Error: this command must run inside a project folder (contains a "build-script.json" file).');
				console.error('  or use \x1B[38;5;14mbuild-script init\x1B[0m to create this file in current folder.');
				process.exit(1);
			}
			this.rawProjectJson = loadJsonFileSync(this.configFilePath);
		}
		return this.rawProjectJson!;
	}

	isProjectJsonExists() {
		return existsSync(this.configFilePath);
	}

	init() {
		const projectJson = this.readProjectJson();

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
			let { title, after, run } = def;
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
		}

		this.plugins = rectLoadDefine(projectJson.load || []);
		resetLoader();
		for (const { file, args } of this.plugins) {
			loadPlugin(file, args);
		}
	}

	public async writeBack() {
		const packageJson = await this.readPackageJson();
		const data = reformatJson(this.toObject(), getFormatInfo(packageJson) || {});
		await writeJsonFile(this.configFilePath, data);
	}

	pushPlugin(file: string, args: string[]) {
		this.plugins!.push({ file, args });
	}
}
