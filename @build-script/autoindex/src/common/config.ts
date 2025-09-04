import { NotFoundError, ProjectConfig } from '@build-script/rushstack-config-loader';
import { ExitCode } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync, shutdown } from '@idlebox/node';
import { basename, resolve } from 'node:path';
import { ConfigKind, schemaFile, type ICliArgs } from './cli.js';

interface IConfigFile {
	project?: string;
	output?: string;
	include?: string[];
	exclude?: string[];
	stripTags?: string[];
	absolute?: string;
}

export interface IContext {
	watchMode: boolean;
	debugMode: boolean;
	outputFile: string;
	excludePatterns: string[];
	includePatterns: string[];
	absoluteImport: undefined | string;
	stripTags: string[];
	project: string;
	verboseMode: boolean;
}

async function loadConfigFile(configType: ConfigKind, configFile: string, context: Partial<IContext>, logger: IMyLogger) {
	if (configType === ConfigKind.DISABLE) {
		logger.debug`由于命令行参数，跳过配置文件: ${configFile}`;
		return;
	}

	logger.debug`即将加载配置文件: ${configFile}`;
	logger.verbose`使用schema文件: ${schemaFile}`;

	const packageJsonFile = findUpUntilSync({ file: ['package.json', 'package.yaml'], from: context.project ?? process.cwd() });
	if (!packageJsonFile) {
		logger.error`无法找到项目根目录，请确保在正确的目录下运行。`;
		shutdown(1);
	}
	logger.debug`项目package: ${packageJsonFile}`;
	const projectRoot = resolve(packageJsonFile, '..');

	const config = new ProjectConfig(projectRoot, undefined, logger);

	try {
		const configFileData = config.loadSingleJson<IConfigFile>(basename(configFile, '.json'), schemaFile);
		logger.verbose`内容: ${configFileData}`;

		if (!context.project) {
			if (!configFileData.project) {
				logger.error`配置文件中未指定项目路径，必须传入参数`;
				shutdown(1);
			}
			context.project = configFileData.project;
		}

		if (!context.absoluteImport && configFileData.absolute) context.absoluteImport = configFileData.absolute;

		if (!context.outputFile && configFileData.output) context.outputFile = configFileData.output;

		if (!context.includePatterns) context.includePatterns = [];
		if (configFileData.include?.length) context.includePatterns.push(...configFileData.include);

		if (!context.excludePatterns) context.excludePatterns = [];
		if (configFileData.exclude?.length) context.excludePatterns.push(...configFileData.exclude);

		if (!context.stripTags) context.stripTags = [];
		if (configFileData.stripTags?.length) context.stripTags.push(...configFileData.stripTags);
	} catch (e: unknown) {
		if (e instanceof NotFoundError) {
			if (configType === ConfigKind.REQUIRED) {
				logger.error(`无法加载配置文件: ${e.message}`);
				shutdown(ExitCode.USAGE);
			} else {
				logger.verbose`由于文件不存在，未使用配置文件（${e}）`;
			}
		} else {
			throw e;
		}
	}
}

export async function createContext(args: ICliArgs, logger: IMyLogger): Promise<IContext> {
	const context: Partial<IContext> = {
		watchMode: args.watchMode,
		debugMode: args.debugMode,
		outputFile: args.outputFile,
		excludePatterns: args.excludePatterns,
		includePatterns: args.includePatterns,
		absoluteImport: undefined,
		stripTags: args.skipTags,
		project: args.project,
		verboseMode: args.verboseMode,
	};

	await loadConfigFile(args.configType, args.configFile, context, logger);

	if (!context.outputFile) {
		context.outputFile = './autoindex.generated';
	}
	if (!context.project) {
		if (args.configType === ConfigKind.IMPLICIT) {
			// 如果是隐式配置，则必须在命令行中指定项目路径
			logger.error`未指定项目路径，需要额外参数或在配置文件中指定`;
			shutdown(ExitCode.USAGE);
		}
	}

	logger.verbose`最终配置: ${context}`;
	return context as IContext;
}
