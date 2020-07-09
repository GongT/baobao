import { commandInPath } from '@idlebox/node';
import * as execa from 'execa';
import { stat, Stats } from 'fs';

export interface PackageManagerConstructor {
	new (cwd: string): PackageManager;
}

export abstract class PackageManager {
	public abstract readonly friendlyName: string;
	protected abstract readonly cliName: string;
	protected abstract readonly packageName: string;
	protected abstract readonly installCommand: string;
	protected abstract readonly installDevFlag: string;
	protected abstract readonly uninstallCommand: string;
	protected readonly runCommand: string = 'run';
	protected readonly initCommand: string = 'run';
	protected readonly showCommand: string = 'show';
	protected abstract readonly syncCommand: string;

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

	public invokeCli(cmd: string, ...args: string[]): Promise<void> {
		const aa = [cmd, ...args].filter((v) => !!v);
		return this._invoke(this.cliName, aa);
	}

	protected async _invoke(cmd: string, args: string[]): Promise<void> {
		process.stderr.isTTY && console.error('\x1B[38;5;14m%s %s\x1B[0m', cmd, args.join(' '));
		await execa(cmd, args, {
			stdio: 'inherit',
			cwd: this.cwd,
		});
	}

	public run(script: string, ...args: string[]) {
		return this.invokeCli(this.runCommand, script, ...args);
	}

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

	public init(...args: string[]) {
		return this.invokeCli(this.initCommand, ...args);
	}

	public exists() {
		return commandInPath(this.cliName);
	}

	public sync(...args: string[]) {
		return this.invokeCli(this.syncCommand, ...args);
	}

	public show(...args: string[]) {
		return this.invokeCli(this.showCommand, ...args);
	}
}
