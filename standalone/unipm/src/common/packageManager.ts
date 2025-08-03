import { checkChildProcessResult, commandInPath } from '@idlebox/node';
import { execa, type Options as ExecaOptions } from 'execa';
import { stat, type Stats } from 'node:fs';

export interface PackageManagerConstructor {
	new (cwd: string): PackageManager;
}

export enum PackageManagerType {
	NPM = 0,
	PNPM = 1,
	RUSH = 2,
	YARN = 3,
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
	public detect(): Promise<this | undefined> {
		return this._detect().then(
			(found) => {
				return found ? this : undefined;
			},
			(e) => {
				console.error('Exception of detect() package manager %s\n%s', this.friendlyName, e.stack);
				return undefined;
			},
		);
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

	/** spawn package manager binary, mute output */
	protected async _invokeErrorLater(cmd: string, args: string[], spawnOptions: Omit<ExecaOptions, 'stdio' | 'encoding'> = {}): Promise<void> {
		const p = this.__invoke(cmd, args, {
			...spawnOptions,
			stdio: ['ignore', 'pipe', 'pipe'],
			all: true,
			encoding: 'utf8',
			reject: false,
		});
		return p.then((ret) => {
			try {
				checkChildProcessResult(ret);
			} catch (e) {
				console.error(ret.all);
				throw e;
			}
		});
	}

	protected async _invoke(cmd: string, args: string[], spawnOptions: ExecaOptions = {}): Promise<void> {
		await this.__invoke(cmd, args, spawnOptions);
	}

	private __invoke(cmd: string, args: string[], spawnOptions: ExecaOptions) {
		this.displayBeforeCommandRun && console.error('\x1B[38;5;14m%s %s\x1B[0m', cmd, args.join(' '));
		return execa(cmd, args, {
			stdio: 'inherit',
			cwd: this.cwd,
			reject: true,
			...spawnOptions,
		});
	}

	/** run scripts in package.json, by package manager */
	public run(script: string, ...args: string[]) {
		// TODO: run node_modules/.bin
		return this.invokeCli(this.runCommand, script, ...args);
	}

	/** install packages
	 *    * add packages into package.json
	 *    * if "-D" or "--dev" in `packages`, add them to devDependencies
	 **/
	public install(...packages: string[]) {
		const i1 = packages.indexOf('-D');
		if (i1 !== -1) {
			packages.splice(i1, 1);
			packages.unshift(this.installDevFlag);
		}
		const i2 = packages.indexOf('--dev');
		if (i2 !== -1) {
			packages.splice(i2, 1);
			packages.unshift(this.installDevFlag);
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
