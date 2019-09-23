import * as command from 'command-exists';
import * as execa from 'execa';
import { stat, Stats } from 'fs';

export interface PackageManagerConstructor {
	new(cwd: string): PackageManager;
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

	public detect(): Promise<boolean> {
		return this._detect().catch((e) => {
			console.error('Exception of detect() package manager %s\n%s', this.friendlyName, e.stack);
			return false;
		});
	}

	protected abstract _detect(): Promise<boolean>;

	public constructor(protected readonly cwd: string) {
	}

	protected _detectFile(file: string) {
		return new Promise<boolean>((resolve) => {
			const wrappedCallback = (err: Error | null, data: Stats) => err ? resolve(false) : resolve(!!data);
			stat(file, wrappedCallback);
		});
	}

	public async invokeCli(cmd: string, ...args: string[]): Promise<void> {
		await execa(this.cliName, [cmd, ...args], {
			stdio: 'inherit',
			cwd: this.cwd,
		});
	}

	public run(script: string, ...args: string[]) {
		return this.invokeCli(this.runCommand, script, ...args);
	}

	public install(...packages: string[]) {
		return this.invokeCli(this.installCommand, ...packages);
	}

	public installDev(...packages: string[]) {
		return this.install(this.installCommand, this.installDevFlag, ...packages);
	}

	public uninstall(...packages: string[]) {
		return this.invokeCli(this.uninstallCommand, ...packages);
	}

	public init() {
		return this.invokeCli(this.initCommand);
	}

	public exists() {
		return command(this.cliName).catch(() => {
			return false;
		});
	}
}
