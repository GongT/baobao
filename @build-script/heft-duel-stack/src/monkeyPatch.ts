import { IScopedLogger } from '@rushstack/heft';
import { ColorValue, ITerminalProvider } from '@rushstack/node-core-library';

import type {
	ITypeScriptBuilderConfiguration,
	TypeScriptBuilder as TypeScriptBuilderClass,
} from '@rushstack/heft/lib/plugins/TypeScriptPlugin/TypeScriptBuilder';
import type { HeftSession } from '@rushstack/heft/lib/pluginFramework/HeftSession';
/**
 * remove all require above
 * MUST AT TOP, ALL STATEMENTS ABOVE NEVER RUN
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
	if (process.env.HEFT_DUEL_STACK) {
		return process.env.HEFT_DUEL_STACK;
	}
	for (const file of Object.keys(require.cache)) {
		if (!file.endsWith('package.json')) continue;

		const mdl = require.cache[file]!;
		if (!mdl.exports) continue;

		if (mdl.exports.name === packageName) {
			return (process.env.HEFT_DUEL_STACK = file);
		}
	}
	const subRequire = require('module').createRequire(process.cwd() + '/package.json');
	try {
		return (process.env.HEFT_DUEL_STACK = subRequire.resolve(packageName + '/package.json'));
	} catch {}

	if (die) {
		throw new Error(`can not found self (${packageName}): package.json not loaded`);
	}
	debugger;
	return '';
}

class TypeScriptBuilderExtended extends TypeScriptBuilder {
	protected declare readonly _configuration: IExtendConfig & ITypeScriptBuilder['_configuration'];
	private readonly isDebug: boolean;
	private readonly selfBuilding: boolean;

	constructor(
		parentGlobalTerminalProvider: ITerminalProvider,
		configuration: ITypeScriptBuilderConfiguration & Partial<IExtendConfig>,
		heftSession: HeftSession,
		emitCallback: () => void
	) {
		super(parentGlobalTerminalProvider, configuration, heftSession, emitCallback);
		this.selfBuilding = configuration.buildFolder.endsWith('@build-script/heft-duel-stack');

		if (configuration.builderPackageDir) {
			this._configuration.builderPackageDir = configuration.builderPackageDir;
		} else {
			this._configuration.builderPackageDir = findSelf();
		}

		this.isDebug = !!heftSession?.debugMode;
	}

	protected async invokeAsync(): Promise<void> {
		const logger = await this.requestScopedLoggerAsync('monkey-patch');

		const realTypescript = this._configuration.typeScriptToolPath;

		logger.terminal.writeLine('using patched ', { text: 'typescript', foregroundColor: ColorValue.Cyan }, '@v', {
			text: require(realTypescript + '/package.json').version,
			foregroundColor: ColorValue.Magenta,
		});
		if (this.selfBuilding) {
			logger.terminal.writeLine('self building, skip patch');
			return super.invokeAsync();
		}

		logger.terminal.writeLine({ text: `  typescript at: ${realTypescript}`, foregroundColor: ColorValue.Gray });
		logger.terminal.writeLine({ text: `  source code at: ${__filename}`, foregroundColor: ColorValue.Gray });

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

			const tlog = await this.requestScopedLoggerAsync('transform');

			logger.terminal.writeLine({
				text: `  patcher file is: ${buildRequire.resolve('./lib/typescriptPatch')}`,
				foregroundColor: ColorValue.Gray,
			});

			buildRequire('./lib/typescriptPatch').patch(realTypescript, rsc.require, this.isDebug, tlog);
		} catch (e: any) {
			logger.terminal.writeError(e.stack);
			throw e;
		}

		return super.invokeAsync();
	}
}

if (findSelf(false)) {
	console.log('[monkey-patch] wrapped TypeScriptBuilder loaded success.');
	module.exports.TypeScriptBuilder = TypeScriptBuilderExtended;
} else {
	console.log('[monkey-patch] missing self, not run from plugin interface.');
}
