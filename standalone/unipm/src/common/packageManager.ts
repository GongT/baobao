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
	protected async _invokeErrorLater(
		cmd: string,
		args: string[],
		spawnOptions: Omit<ExecaOptions, 'stdio' | 'stdin' | 'stdout' | 'stderr' | 'encoding'> = {},
	): Promise<void> {
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
		const saveDev = popFlags(packages, '-D', '--save-dev').length > 0;
		popFlags(packages, '-P', '--save', '--save-prod');
		const saveOpt = popFlags(packages, '-O', '--save-optional').length > 0;
		const savePeer = popFlags(packages, '-E', '--save-peer').length > 0;

		const versionExact = popFlags(packages, '-E', '--save-exact').length > 0;
		const versionPrefix = popValue(packages, '--save-prefix');

		let mode: InstallMode;
		if (saveDev) {
			mode = InstallMode.Development;
		} else if (saveOpt) {
			mode = InstallMode.Optional;
		} else if (savePeer) {
			mode = InstallMode.Peer;
		} else {
			mode = InstallMode.Production;
		}

		return this._install({ mode, exact: versionExact, prefix: (versionPrefix ?? '') as any, argv: packages });
	}

	protected async _install(options: IInstallOptions) {
		const exArgs: string[] = [defaultSaveArg(options.mode)];

		if (options.prefix) exArgs.push(`--save-prefix=${options.prefix}`);
		if (options.exact) exArgs.push('--save-exact');

		if (options.prefix) {
			exArgs.push(`--save-prefix=${options.prefix}`);
		}
		this.invokeCli(this.installCommand, ...exArgs, ...options.argv);
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

// function indexOf<T>(arr: T[], ...items: T[]): number {
// 	for (let i = 0; i < arr.length; i++) {
// 		if (items.includes(arr[i])) {
// 			return i;
// 		}
// 	}
// 	return -1;
// }

function popValue(arr: string[], ...items: string[]): string | undefined {
	for (const [i, value] of arr.entries()) {
		for (const name of items) {
			if (value.startsWith(`${name}=`)) {
				const p = arr.splice(i, 1)[0];
				return p.slice(name.length + 1);
			} else if (value === name) {
				return arr.splice(i, 2)[1];
			}
		}
	}
	return undefined;
}

function popFlags<T>(arr: T[], ...items: T[]): T[] {
	const popped: T[] = [];
	for (let i = arr.length - 1; i >= 0; i--) {
		if (items.includes(arr[i])) {
			popped.unshift(arr.splice(i, 1)[0]);
		}
	}
	return popped;
}

export enum InstallMode {
	Production,
	Development,
	Optional,
	Peer,
}

export interface IInstallOptions {
	readonly argv: string[];
	readonly mode: InstallMode;
	readonly prefix: '^' | '~' | '=' | '';
	readonly exact: boolean;
}

export function defaultSaveArg(mode: InstallMode) {
	switch (mode) {
		case InstallMode.Development:
			return '--save-dev';
		case InstallMode.Optional:
			return '--save-optional';
		case InstallMode.Peer:
			return '--save-peer';
		default:
			return '--save-prod';
	}
}
