import { existsSync } from 'node:fs';
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parse as parseYaml, stringify } from 'yaml';

export interface IApplyPnpmWorkspaceOptions {
	/**
	 * path to pnpm-workspace.yaml
	 */
	sourceFile: string;
	/**
	 * apply settings and copy file to here
	 */
	targetDir: string;

	isPublish: boolean;
}

export async function applyPublishWorkspace({ sourceFile, targetDir, isPublish }: IApplyPnpmWorkspaceOptions) {
	let registry: string | undefined;
	if (existsSync(sourceFile)) {
		const options = parseYaml(await readFile(sourceFile, 'utf-8'));

		if (isPublish) {
			const published = options['publishConfig'] || options['publish-config'];
			if (published) {
				Object.assign(options, published);
				delete options['publishConfig'];
				delete options['publish-config'];
				options.packages = ['.'];
			}
		}

		const text = stringify(options, {});
		await writeFile(resolve(targetDir, 'pnpm-workspace.yaml'), text);

		// read registry from yaml
		registry = options.registry;
	}

	const npmfile = resolve(sourceFile, '..', isPublish ? '.npmrc-publish' : '.npmrc');
	if (existsSync(npmfile)) {
		await copyFile(npmfile, resolve(targetDir, '.npmrc'));

		// read registry from .npmrc?
	}

	const mockPackage = resolve(targetDir, 'package.json');
	if (!existsSync(mockPackage)) {
		await writeFile(mockPackage, '{}');
	}

	return registry;
}
