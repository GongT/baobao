import { loadJsonFile } from '@idlebox/node-json-edit';
import { findUpUntil } from '@idlebox/node';
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
	readonly syncCommand: string = 'update';

	private rushRoot?: string;
	private subPackageManager?: string;

	async _detect(sub = false): Promise<boolean> {
		const found = await findUpUntil(this.cwd, 'rush.json');
		if (!found) {
			return false;
		}
		this.rushRoot = basename(found);
		const data = parse(await readFile(found, 'utf-8'));
		let pm = '';
		for (const key of ['pnpm', 'npm', 'yarn']) {
			if (data[key + 'Version']) {
				pm = key;
				break;
			}
		}
		if (pm) {
			this.subPackageManager = resolve(this.rushRoot, 'common/temp', `${pm}-local`, 'node_modules/.bin', pm);
		} else {
			if (sub) {
				throw new Error('can not determine sub package manager of rush');
			}
			this.subPackageManager = '';
			console.warn('Warn: can not determine sub package manager of rush.');
		}

		return true;
	}

	async install(..._packages: string[]) {
		const packages = _packages.filter((item) => !item.startsWith('-'));
		const flags = ['--caret', '--skip-update', '--make-consistent'];
		if (_packages.includes('-d') || _packages.includes('--dev')) {
			flags.push('--dev');
		}

		for (const pkg of packages) {
			await super.install(...flags, '-p', pkg);
		}
		await super._invoke(this.cliName, ['update']);
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
				await this._detect(true);
			}

			const aa = [cmd, ...args].filter((v) => !!v);
			return this._invoke(this.subPackageManager!, aa);
		} else {
			return super.invokeCli(cmd, ...args);
		}
	}
}
