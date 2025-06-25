import { ProjectConfig } from '@build-script/rushstack-config-loader';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntilSync } from '@idlebox/node';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { schemaFile, type ICliArgs } from './cli.js';

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

export async function loadConfigFile(args: ICliArgs, logger: IMyLogger): Promise<IContext> {
	const context: IContext = {
		watchMode: args.watchMode,
		debugMode: args.debugMode,
		outputFile: args.outputFile || './autoindex.generated',
		excludePatterns: args.excludePatterns,
		includePatterns: args.includePatterns,
		absoluteImport: undefined,
		stripTags: args.skipTags,
		project: args.project || '',
		verboseMode: args.verboseMode,
	};
	if (!args.useConfigFile) {
		if (!context.project) {
			logger.fatal`命令行与配置文件均未指定项目路径`;
		}
		logger.debug('由于命令行参数，跳过配置文件: config/autoindex.json');
		return context;
	}

	logger.debug`使用配置文件: config/autoindex.json`;
	const packageJsonFile = findUpUntilSync({ file: 'package.json', from: args.project ?? process.cwd() });
	if (!packageJsonFile) {
		throw logger.fatal`无法找到项目根目录，请确保在正确的目录下运行。`;
	}
	logger.debug`项目package: ${packageJsonFile}`;
	const projectRoot = resolve(packageJsonFile, '..');

	const config = new ProjectConfig(projectRoot, undefined, logger.warn);
	logger.verbose`使用schema文件: ${schemaFile}`;
	const content = JSON.parse(await readFile(schemaFile, 'utf-8'));
	const configFileData = config.loadSingleJson<IConfigFile>('autoindex', content);

	if (!context.project) {
		if (!configFileData.project) {
			throw logger.fatal`配置文件中未指定项目路径，必须传入参数`;
		}
		context.project = configFileData.project;
	}

	if (!context.absoluteImport && configFileData.absolute) context.absoluteImport = configFileData.absolute;

	if (!context.outputFile && configFileData.output) context.outputFile = configFileData.output;

	if (!context.includePatterns && configFileData.include) context.includePatterns = configFileData.include;

	if (!context.excludePatterns && configFileData.exclude) context.excludePatterns = configFileData.exclude;

	if (!context.stripTags && configFileData.stripTags) context.stripTags = configFileData.stripTags;

	logger.verbose`最终配置: ${context}`;
	return context;
}
