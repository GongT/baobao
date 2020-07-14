import * as execa from 'execa';
import { stat, Stats } from 'fs';
import { commandInPath } from '@idlebox/node';

export interface PackageManagerConstructor {
	new (cwd: string): PackageManager;
}

export enum PackageManagerType {
	NPM,
	PNPM,
	RUSH,
	YARN,
}

export abstract class PackageManager {
	public abstract readonly friendlyName: string;
	public abstract readonly type: PackageManagerType;
	protected abstract readonly cliName: string;
	protected abstract readonly packageName: string;
	protected abstract readonly installCommand: string;
	protected abstract readonly installDevFlag: string;
	protected abstract readonly uninstallCommand: string;
	protected readonly runCommand: string = 'run';
	protected readonly initCommand: string = 'run';
	protected readonly showCommand: string = 'show';
	protected abstract readonly syncCommand: string;

	/** if set to true, debug info will print to stderr, default is process.stderr.isTTY */
	public displayBeforeCommandRun = process.stderr.isTTY;

	/** detect if this package manager is used by current project */
	public detect(): Promise<boolean> {
		return this._detect().catch((e) => {
			console.error('Exception of detect() package manager %s\n%s', this.friendlyName, e.stack);
			return false;
		});
	}

	protected abstract _detect(): Promise<boolean>;

	public constructor(protected readonly cwd: string) {}

	protected _detectFile(file: string) {
		return new Promise<boolean>((resolve) => {
			const wrappedCallback = (err: Error | null, data: Stats) => (err ? resolve(false) : resolve(!!data));
			stat(file, wrappedCallback);
		});
	}

	/** spawn package manager binary, with inherit stdio */
	public invokeCli(cmd: string, ...args: string[]): Promise<void> {
		const aa = [cmd, ...args].filter((v) => !!v);
		return this._invoke(this.cliName, aa);
	}

	protected async _invoke(cmd: string, args: string[], spawnOptions: execa.Options = {}): Promise<void> {
		this.displayBeforeCommandRun && console.error('\x1B[38;5;14m%s %s\x1B[0m', cmd, args.join(' '));
		await execa(cmd, args, {
			stdio: 'inherit',
			cwd: this.cwd,
			...spawnOptions,
		});
	}

	/** run scripts in package.json, by package manager */
	public run(script: string, ...args: string[]) {
		return this.invokeCli(this.runCommand, script, ...args);
	}

	/** install packages
	 *    * add packages into package.json
	 *    * if "-d" or "--dev" in `packages`, add them to devDependencies
	 **/
	public install(...packages: string[]) {
		const i1 = packages.indexOf('-d');
		if (i1 !== -1) {
			packages.splice(i1, 1, this.installDevFlag);
		}
		const i2 = packages.indexOf('--dev');
		if (i2 !== -1) {
			packages.splice(i2, 1, this.installDevFlag);
		}
		return this.invokeCli(this.installCommand, ...packages);
	}

	public uninstall(...packages: string[]) {
		return this.invokeCli(this.uninstallCommand, ...packages);
	}

	/** run package init command, normally this will create a new package.json, and maybe ask some questions */
	public init(...args: string[]) {
		return this.invokeCli(this.initCommand, ...args);
	}

	/** detect this package manager callable (installed and in PATH) */
	public exists() {
		return commandInPath(this.cliName);
	}

	/** sync package.json to node_modules, eg: npm i */
	public sync(...args: string[]) {
		return this.invokeCli(this.syncCommand, ...args);
	}

	/** show package info from NPM registry */
	public show(...args: string[]) {
		return this.invokeCli(this.showCommand, ...args);
	}
}
