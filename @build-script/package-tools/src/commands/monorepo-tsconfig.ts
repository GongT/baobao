import { createWorkspace, type IPackageInfo } from '@build-script/monorepo-lib';
import { argv, CommandDefine, logger } from '@idlebox/cli';
import { resolveExportPath } from '@idlebox/common';
import { loadJsonFile, writeJsonFile, writeJsonFileBack } from '@idlebox/json-edit';
import { relativePath } from '@idlebox/node';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export class Command extends CommandDefine {
	protected override readonly _usage = '';
	protected override readonly _description = '为所有项目的 tsconfig.json 添加 references 字段';
	protected override readonly _help = `查找tsconfig.json和src/tsconfig.json\n    如果不在这里，可以在package.json中设置exports['./tsconfig.json'] = './xxxx'`;
	protected override readonly _arguments = {
		'--dev': {
			usage: true,
			flag: true,
			description: '也将devDependencies中的包添加到references中',
		},
	};
}

const path_element_id = 'package-tools/monorepo-tsconfig';
interface IReference {
	$id?: string;
	path: string;
}

export async function main() {
	const includeDev = argv.flag('--dev') > 0;

	const repo = await createWorkspace();

	try {
		await repo.requireGitClean();
	} catch (e: any) {
		logger.fatal(e.message);
	}

	const list = await repo.listPackages();
	const configAbsMap = new Map<IPackageInfo, string>();
	const projNameMap = new Map<string, IPackageInfo>();
	// repo.root

	logger.log(`在${list.length}个项目中搜索tsconfig.json文件...`);
	for (const proj of list) {
		projNameMap.set(proj.name, proj);

		if (typeof proj.packageJson.exports === 'object' && proj.packageJson.exports['./tsconfig.json']) {
			const file = resolveExportPath(proj.packageJson.exports['./tsconfig.json'], ['default']);
			if (file) {
				configAbsMap.set(proj, resolve(proj.absolute, file));
				continue;
			}
		}

		let file = resolve(proj.absolute, 'tsconfig.json');
		if (existsSync(file)) {
			configAbsMap.set(proj, file);
			continue;
		}

		file = resolve(proj.absolute, 'src', 'tsconfig.json');
		if (existsSync(file)) {
			configAbsMap.set(proj, file);
			continue;
		}
		logger.log(`未找到${proj.name}的tsconfig.json文件`);
	}

	const batchSave = new Map<IPackageInfo, any>();
	for (const [proj, tsconfig] of configAbsMap.entries()) {
		logger.log(`正在处理${proj.name}的tsconfig.json文件...`);
		const tsconfigJson = await loadJsonFile(tsconfig);
		batchSave.set(proj, tsconfigJson);

		if (!tsconfigJson.references) tsconfigJson.references = [];
		const references: IReference[] = tsconfigJson.references;

		const workspaceDeps = filterByLink(proj.packageJson.dependencies);
		if (includeDev) {
			workspaceDeps.push(...filterByLink(proj.packageJson.devDependencies));
		}

		const knownPaths = [];

		for (const name of workspaceDeps) {
			const depProj = projNameMap.get(name);
			if (!depProj) {
				throw new Error(`在${proj.name}的package.json中存在未知依赖项目：${name}`);
			}

			const depTsconfig = configAbsMap.get(depProj);
			if (!depTsconfig) continue;

			const path = relativePath(dirname(tsconfig), depTsconfig);
			const added = addToSet(references, path);
			if (added) logger.log(`  - 添加${path}`);

			knownPaths.push(path);
		}

		for (const ref of references.toReversed()) {
			if (ref.$id !== path_element_id) continue;

			if (knownPaths.includes(ref.path)) continue;
			// 删除不再引用
			const index = references.lastIndexOf(ref);
			references.splice(index, 1);
			logger.log(`  - 删除${ref.path}`);
		}

		if (references.length === 0) {
			tsconfigJson.references = undefined;
			logger.log(`  - 删除references字段`);
		}
	}

	for (const [proj, tsconfigJson] of batchSave.entries()) {
		const ch = await writeJsonFileBack(tsconfigJson);

		logger.log(`  - ${proj.name} ${ch ? '已修改' : '未修改'} tsconfig.json`);
	}

	const rootTsconfig = resolve(repo.root, 'tsconfig.everything.json');
	const references: IReference[] = [];
	for (const tsconfig of configAbsMap.values()) {
		references.push({ path: relativePath(repo.root, tsconfig) });
	}
	await writeJsonFile(rootTsconfig, {
		compilerOptions: {
			esModuleInterop: true,
			outDir: './lib',
			moduleResolution: 'Node',
			module: 'ESNext',
			target: 'ESNext',
		},
		references,
	});
}

function addToSet(set: IReference[], value: string) {
	if (set.some((item) => item.path === value)) {
		return false;
	}

	set.push({ $id: path_element_id, path: value });
	return true;
}

function filterByLink(dependencies: Record<string, string>): string[] {
	// 只保留引用workspace的
	if (!dependencies) return [];

	return Object.keys(dependencies).filter((dep) => {
		const version = dependencies[dep];
		return version.startsWith('workspace:');
	});
}
