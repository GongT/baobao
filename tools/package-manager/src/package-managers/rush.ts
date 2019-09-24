import { loadJsonFile } from '@idlebox/node-json-edit';
import { findUpUntil } from '@idlebox/platform';
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
	private subPackageManager?: string;

	async _detect(): Promise<boolean> {
		const found = await findUpUntil(this.cwd, 'rush.json');
		if (!found) {
			return false;
		}
		this.rushRoot = basename(found);
		const data = parse(await readFile(found, 'utf-8'));
		for (const key of ['pnpm', 'npm', 'yarn']) {
			if (data[key]) {
				this.subPackageManager = key;
				break;
			}
		}
		return true;
	}

	install(..._packages: string[]) {
		const packages: string[] = ['--caret'];
		for (const item of _packages) {
			if (!item.startsWith('-')) {
				packages.push('-p');
			}
			packages.push(item);
		}
		return super.install(...packages);
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
			if (!this.subPackageManager) {
				await this.detect();
			}

			const aa = [cmd, ...args].filter(v => !!v);
			return this._invoke(this.subPackageManager!, aa);
		} else {
			return super.invokeCli(cmd, ...args);
		}
	}
}
