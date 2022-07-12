import { ColorValue, ITerminalProvider } from '@rushstack/node-core-library';

import type {
	ITypeScriptBuilderConfiguration,
	TypeScriptBuilder as TypeScriptBuilderClass,
} from '@rushstack/heft/lib/plugins/TypeScriptPlugin/TypeScriptBuilder';
import type { HeftSession } from '@rushstack/heft/lib/pluginFramework/HeftSession';

/**
 * remove all require above
 * MUST FIRST
 */
const packageName = '@build-script/heft-duel-stack';

export interface ITypeScriptBuilder extends InstanceType<typeof TypeScriptBuilderClass> {}

// @ts-ignore
declare class TypeScriptBuilder implements ITypeScriptBuilder {
	constructor(...parameters: ConstructorParameters<typeof TypeScriptBuilderClass>);
	protected _configuration: ITypeScriptBuilder['_configuration'];
	protected requestScopedLoggerAsync: ITypeScriptBuilder['requestScopedLoggerAsync'];
	protected invokeAsync(
		...p: Parameters<ITypeScriptBuilder['invokeAsync']>
	): ReturnType<ITypeScriptBuilder['invokeAsync']>;
}

interface IExtendConfig {
	builderPackageDir: string;
}

function findSelf(die = true): string {
	for (const file of Object.keys(require.cache)) {
		if (file.endsWith(packageName + '/package.json')) {
			return file;
		}
	}
	if (die) {
		throw new Error(`can not found self (${packageName}): package.json not loaded`);
	}
	return '';
}

class TypeScriptBuilderExtended extends TypeScriptBuilder {
	protected declare readonly _configuration: IExtendConfig & ITypeScriptBuilder['_configuration'];
	private readonly isDebug: boolean;

	constructor(
		parentGlobalTerminalProvider: ITerminalProvider,
		configuration: ITypeScriptBuilderConfiguration & Partial<IExtendConfig>,
		heftSession: HeftSession,
		emitCallback: () => void
	) {
		super(parentGlobalTerminalProvider, configuration, heftSession, emitCallback);

		if (configuration.builderPackageDir) {
			this._configuration.builderPackageDir = configuration.builderPackageDir;
		} else {
			this._configuration.builderPackageDir = findSelf();
		}

		this.isDebug = !!heftSession?.debugMode;
	}

	protected async invokeAsync(): Promise<void> {
		const logger = await this.requestScopedLoggerAsync('monkey-patch');
		try {
			const { createRequire } = require('module');

			const builderFolder = this._configuration.builderPackageDir;
			const packageFolder = this._configuration.buildFolder;

			const buildRequire = createRequire(builderFolder);
			const loader = buildRequire(
				'@build-script/rushstack-config-loader'
			) as typeof import('@build-script/rushstack-config-loader');
			const rsc = new loader.RushStackConfig(packageFolder, undefined, (txt) =>
				logger.terminal.writeWarningLine(txt)
			);

			const realTypescript = this._configuration.typeScriptToolPath;
			const tlog = await this.requestScopedLoggerAsync('transform');
			buildRequire('./lib/typescriptPatch').patch(realTypescript, rsc.require, this.isDebug, tlog);

			logger.terminal.writeLine(
				`patching `,
				{ text: 'typescript', foregroundColor: ColorValue.Cyan },
				'@v',
				{ text: require(realTypescript + '/package.json').version, foregroundColor: ColorValue.Magenta },
				` using ${buildRequire.resolve('./lib/typescriptPatch')}`
			);
		} catch (e: any) {
			logger.terminal.writeError(e.stack);
			throw e;
		}

		return super.invokeAsync();
	}
}

if (findSelf(false)) {
	module.exports.TypeScriptBuilder = TypeScriptBuilderExtended;
}
