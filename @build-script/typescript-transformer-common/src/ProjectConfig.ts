import ts from 'typescript';
import { getValidPackageFile } from './inc/getValidPackageName';
import { IDebug } from './logger';

export class ProjectConfig {
	public readonly tsconfigPath: string;

	constructor(protected readonly options: ts.CompilerOptions, protected readonly logger: IDebug) {
		this.tsconfigPath = options['configFilePath'] as any;
		if (!this.tsconfigPath) {
			logger.error(
				`current TypeScript API (${ts.version}) not compitable with "${require('../package.json').name}"`
			);
		}
	}

	private _packageJsonCache?: string | null;
	public findPackageJson(): string | undefined {
		if (this._packageJsonCache === undefined) {
			this._packageJsonCache = getValidPackageFile(this.tsconfigPath);
		}
		return this._packageJsonCache || undefined;
	}

	get packageJson(): string {
		const pkg = this.findPackageJson();
		if (!pkg) {
			const msg = 'missing package.json, find from ' + this.tsconfigPath;
			this.logger.error(msg);
			throw new Error(msg);
		}
		return pkg;
	}
}
