import { resolve } from 'path';
import { format } from 'util';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { IExtendParsedCommandLine, loadTsConfigJsonFile } from '@idlebox/tsconfig-loader';
import { generateIndex, ILogger, loadFilter } from '@idlebox/typescript-surface-analyzer';
import { IMyOptions, PLUGIN_NAME } from './plugin';

import type {
	IBuildStageContext,
	HeftConfiguration,
	HeftSession,
	ICompileSubstage,
	ScopedLogger,
} from '@rushstack/heft';

export function applyCreateIndex(
	heftSession: HeftSession,
	heftConfiguration: HeftConfiguration,
	config: RushStackConfig,
	options: IMyOptions
) {
	const logger = heftSession.requestScopedLogger(PLUGIN_NAME);

	heftSession.hooks.build.tap(PLUGIN_NAME, (build: IBuildStageContext) => {
		build.hooks.compile.tap(PLUGIN_NAME, (compile: ICompileSubstage) => {
			compile.hooks.run.tap(PLUGIN_NAME, function _createIndex() {
				createIndex(heftConfiguration, options, config, logger);
			});
		});
	});
}

function findOutputFile(
	logger: ScopedLogger,
	config: RushStackConfig,
	heftConfiguration: HeftConfiguration,
	project: IExtendParsedCommandLine
): string | undefined {
	let outFile: string | undefined;
	const pkgJson: any = heftConfiguration.projectPackageJson;
	let tryPaths: string[] = [
		pkgJson.main,
		pkgJson.module,
		pkgJson.exports,
		pkgJson.exports?.require,
		pkgJson.exports?.import,
		pkgJson.exports?.['.'],
		pkgJson.exports?.['.']?.require,
		pkgJson.exports?.['.']?.import,
	]
		.filter((e) => typeof e === 'string')
		.map((e: string) => {
			return resolve(heftConfiguration.buildFolder, e.replace(/^\/+/, ''));
		});
	const input = config.apiExtractor();

	if (input) {
		tryPaths.unshift(resolve(input.mainEntryPointFilePath));
	}

	for (const distFile of tryPaths) {
		let root = '';
		if (distFile.endsWith('.d.ts')) {
			root = project.options.declarationDir || '~~~~~';
		} else {
			root = project.options.outDir;
		}
		if (distFile.startsWith(root)) {
			outFile = resolve(distFile.replace(root, project.options.rootDir + '/'));
			break;
		}
	}

	if (!outFile) {
		logger.emitError(
			new Error(
				'Can not determine index.ts location from api-extractor.json and package.json.\nTypeScript config:\n  outDir= ' +
					project.options.outDir +
					'\n  declarationDir= ' +
					project.options.declarationDir +
					'\nTried paths:\n  - ' +
					tryPaths.join('\n  - ')
			)
		);
		return undefined;
	}

	const ext = /\.[cm]?js$/i;
	const ext2 = /\.d\.ts$/i;
	if (ext.test(outFile)) {
		outFile = outFile.replace(ext, '.ts');
	} else if (ext2.test(outFile)) {
		outFile = outFile.replace(ext2, '.ts');
	} else {
		outFile += '.ts';
	}
	return outFile;
}

export function createIndex(
	heftConfiguration: HeftConfiguration,
	options: IMyOptions = {},
	config: RushStackConfig,
	logger: ScopedLogger
) {
	let project: IExtendParsedCommandLine;
	if (options.project) {
		project = loadTsConfigJsonFile(resolve(heftConfiguration.buildFolder, options.project));
	} else {
		project = config.tsconfig();
	}

	let outFile: string;
	if (options.outFile) {
		outFile = options.outFile;
	} else {
		const found = findOutputFile(logger, config, heftConfiguration, project);
		if (!found) {
			return;
		}
		outFile = found;
	}

	let filter;
	if (options.filterFile) {
		filter = loadFilter(heftConfiguration.buildFolder, options.filterFile);
	}

	const myLogger: ILogger = {
		log: function (msg: string, ...args: any[]): void {
			logger.terminal.writeDebugLine(format(msg, ...args));
		},
		error: function (msg: string, ...args: any[]): void {
			logger.terminal.writeErrorLine(format(msg, ...args));
		},
		debug: function (msg: string, ...args: any[]): void {
			logger.terminal.writeVerboseLine(format(msg, ...args));
		},
	};

	const outFileReal = generateIndex({
		excludes: options.excludes || [],
		outFile,
		project,
		filter,
		logger: myLogger,
	});

	logger.terminal.writeLine('[export-index] created file: ' + outFileReal);
}
