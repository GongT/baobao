import { loadJsonFile } from '@idlebox/json-edit';
import { findUpUntil } from '@idlebox/node';
import json5 from 'json5';
import { readFile as readFileAsync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { deletePackageDependency, resortPackage } from '../common/packageJson.js';
import { PackageManager, PackageManagerType } from '../common/packageManager.js';

const readFile = promisify(readFileAsync);
const subCommands = ['run', 'init', 'show', 'view'];

/** @internal */
export class Rush extends PackageManager {
	readonly type = PackageManagerType.RUSH;
	readonly friendlyName: string = 'rush';
	readonly cliName: string = 'rush';
	readonly installCommand: string = 'add';
	readonly packageName: string = '@microsoft/rush';
	readonly uninstallCommand: string = '!!';
	readonly installDevFlag: string = '--dev';
	readonly syncCommand: string = 'update';
	override showCommand = '';

	private rushRoot?: string;
	private subPackageManager?: string;

	async _detect(sub = false): Promise<boolean> {
		const found = await findUpUntil({ from: this.cwd, file: 'rush.json' });
		if (!found) {
			return false;
		}
		this.rushRoot = dirname(found);
		const data = json5.parse(await readFile(found, 'utf-8'));
		let pm = '';
		for (const key of ['pnpm', 'npm', 'yarn']) {
			if (data[`${key}Version`]) {
				pm = key;
				break;
			}
		}
		if (pm) {
			if (pm === 'pnpm') {
				this.showCommand = 'view';
			}

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

	public override async uninstall(...packages: string[]): Promise<void> {
		const pkgJson = await findUpUntil({ from: this.cwd, file: 'package.json' });
		if (pkgJson) {
			await deletePackageDependency(pkgJson, ...packages);
		}
		await super._invoke(this.cliName, ['update']);
	}

	override async install(..._packages: string[]) {
		const packages = _packages.filter((item) => !item.startsWith('-'));
		const flags = ['--caret', '--skip-update', '--make-consistent'];
		if (_packages.includes('-D') || _packages.includes('--dev')) {
			flags.push('--dev');
		}

		for (const pkg of packages) {
			await super._invokeErrorLater(this.cliName, [this.installCommand, ...flags, '-p', pkg]);
		}

		const pkgJson = await findUpUntil({ from: this.cwd, file: 'package.json' });
		if (pkgJson) {
			await resortPackage(pkgJson);
		}

		const env = { npm_config_prefer_frozen_lockfile: 'false', npm_config_prefer_offline: 'false' };
		await super._invoke(this.cliName, ['update'], { env });
	}

	override async init() {
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

	public override async invokeCli(cmd: string, ...args: string[]): Promise<void> {
		if (subCommands.includes(cmd)) {
			if (!this.subPackageManager) {
				await this._detect(true);
			}

			const aa = [cmd, ...args].filter((v) => !!v);
			return this._invoke(this.subPackageManager!, aa);
		}
		return super.invokeCli(cmd, ...args);
	}
}
