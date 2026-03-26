import { NotFoundError, ProjectConfig } from '@build-script/rushstack-config-loader';
import type { IMyLogger } from '@idlebox/logger';
import { findPackageJSON } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

interface IConfigFile {
	readonly project?: string;
	readonly build?: boolean;
}

export async function loadConfig(hintLocation: string, logger: IMyLogger): Promise<IConfigFile | undefined> {
	const pkgJsonFile = findPackageJSON(pathToFileURL(resolve(hintLocation, 'package.json')));
	if (!pkgJsonFile) {
		logger.debug`通过 long<${hintLocation}> 未找到package.json，无法加载配置`;
		return;
	}

	try {
		logger.verbose`项目package: ${pkgJsonFile}`;
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
			logger.verbose`由于文件不存在，未使用配置文件（${e}）`;
		} else {
			throw e;
		}
	}
	return;
}
