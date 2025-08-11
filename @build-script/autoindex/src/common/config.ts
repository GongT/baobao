import { NotFoundError, ProjectConfig } from '@build-script/rushstack-config-loader';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { resolve } from 'node:path';
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

async function loadConfigFile(configType: ConfigKind, context: Partial<IContext>, logger: IMyLogger) {
	if (configType === ConfigKind.DISABLE) {
		logger.debug`由于命令行参数，跳过配置文件: config/autoindex.json`;
		return;
	}

	logger.debug`即将加载配置文件: config/autoindex.json`;
	logger.verbose`使用schema文件: ${schemaFile}`;

	const packageJsonFile = findUpUntilSync({ file: ['package.json', 'package.yaml'], from: context.project ?? process.cwd() });
	if (!packageJsonFile) {
		throw logger.fatal`无法找到项目根目录，请确保在正确的目录下运行。`;
	}
	logger.debug`项目package: ${packageJsonFile}`;
	const projectRoot = resolve(packageJsonFile, '..');

	const config = new ProjectConfig(projectRoot, undefined, logger);

	try {
		const configFileData = config.loadSingleJson<IConfigFile>('autoindex', schemaFile);
		logger.verbose`内容: ${configFileData}`;

		if (!context.project) {
			if (!configFileData.project) {
				throw logger.fatal`配置文件中未指定项目路径，必须传入参数`;
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
			logger.verbose`由于文件不存在，未使用配置文件（${e}）`;
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

	await loadConfigFile(args.configType, context, logger);

	if (!context.outputFile) {
		context.outputFile = './autoindex.generated';
	}
	if (!context.project) {
		if (args.configType === ConfigKind.IMPLICIT) {
			// 如果是隐式配置，则必须在命令行中指定项目路径
			logger.fatal`未指定项目路径，需要额外参数或在配置文件中指定`;
		}
	}

	logger.verbose`最终配置: ${context}`;
	return context as IContext;
}
