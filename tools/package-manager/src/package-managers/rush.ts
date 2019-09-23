import { loadJsonFile } from '@idlebox/node-json-edit';
import { findUpUntil } from '@idlebox/platform';
import * as execa from 'execa';
import { readFile as readFileAsync } from 'fs';
import { parse } from 'json5';
import { basename, relative, resolve } from 'path';
import { promisify } from 'util';
import { PackageManager } from '../common/packageManager';

const readFile = promisify(readFileAsync);
const subCommands = ['run', 'init'];

export class Rush extends PackageManager {
	readonly friendlyName: string = 'rush';
	readonly cliName: string = 'rush';
	readonly installCommand: string = 'add';
	readonly packageName: string = '@microsoft/rush';
	readonly uninstallCommand: string = 'remove';
	readonly installDevFlag: string = '--dev';

	private rushRoot?: string;
	private subPakcageManager?: string;

	async _detect(): Promise<boolean> {
		const found = await findUpUntil(this.cwd, 'rush.json');
		if (!found) {
			return false;
		}
		this.rushRoot = basename(found);
		const data = parse(await readFile(found, 'utf-8'));
		for (const key of ['pnpm', 'npm', 'yarn']) {
			if (data[key]) {
				this.subPakcageManager = key;
				break;
			}
		}
		return true;
	}

	install(..._packages: string[]) {
		const packages: string[] = ['--caret'];
		for (const item of _packages) {
			packages.push('-p', item);
		}
		return this.invokeCli(this.installCommand, ...packages);
	}

	async init() {
		await super.init();

		const data = await loadJsonFile(resolve(this.rushRoot!, 'rush.json'));
		const pkg = require(resolve(this.cwd, 'package.json'));

		const alreadyExists = data.projects.some(({ packageName }: any) => {
			return packageName === pkg.name;
		});
		if (alreadyExists) {
			return;
		}

		data.projects.push({
			packageName: pkg.name,
			projectFolder: relative(this.rushRoot!, this.cwd),
			shouldPublish: !pkg.private,
		});
	}

	public async invokeCli(cmd: string, ...args: string[]): Promise<void> {
		if (subCommands.includes(cmd)) {
			if (!this.subPakcageManager) {
				await this.detect();
			}
			await execa(this.subPakcageManager!, [cmd, ...args], {
				stdio: 'inherit',
				cwd: this.cwd,
			});
		} else {
			return super.invokeCli(cmd, ...args);
		}
	}
}
