import { NotFoundError, ProjectConfig } from '@build-script/rushstack-config-loader';
import type { IMyLogger } from '@idlebox/logger';
import { findUpUntil } from '@idlebox/node';
import { readFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { parse } from 'yaml';
import { packageJsonValidNames } from './types.js';

interface IConfigFile {
	readonly project?: string;
	readonly build?: boolean;
}

export async function loadConfig(hintLocation: string, logger: IMyLogger): Promise<IConfigFile | undefined> {
	const pkgJsonFile = await findUpUntil({ file: [...packageJsonValidNames], from: hintLocation, resolveSymlink: true });
	if (!pkgJsonFile) {
		logger.debug`通过 long<${hintLocation}> 未找到package.json，无法加载配置`;
		return;
	}

	try {
		logger.debug`项目package: ${pkgJsonFile}`;
		const config = new ProjectConfig(dirname(pkgJsonFile), undefined, {
			debug: logger.verbose,
			error: logger.warn,
			log: logger.debug,
		});
		const configFileData = config.loadBothJson<IConfigFile>('typescript');
		logger.verbose`内容: ${configFileData}`;

		return {
			project: configFileData?.project,
			build: configFileData?.build ?? false,
		};
	} catch (e: unknown) {
		if (e instanceof NotFoundError) {
			logger.debug`由于文件不存在，未使用配置文件（${e}）`;
		} else {
			throw e;
		}
	}
	return;
}

export async function loadFile(jsonOrYaml: string) {
	const data = await readFile(jsonOrYaml, 'utf-8');
	if (jsonOrYaml.endsWith('.json')) {
		return JSON.parse(data);
	} else {
		return parse(data);
	}
}
