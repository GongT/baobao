import { ProjectConfig } from '@build-script/rushstack-config-loader';
import { logger } from '@idlebox/logger';
import { CSI } from '@idlebox/terminal-control/constants';
import { realpathSync } from 'node:fs';
import type { ICommand, IConfigFile } from '../common/config-file.js';
import { projectRoot } from '../common/paths.js';

export function dumpConfig(config: IConfigFile) {
	const buildObject: Record<string, ICommand> = {};
	for (const [key, value] of config.build.entries()) {
		buildObject[key] = value;
	}
	const mapRaw = {
		buildTitles: config.buildTitles,
		build: buildObject,
		clean: config.clean,
		additionalPaths: config.additionalPaths,
	};

	if (!process.stdout.isTTY) {
		console.log(JSON.stringify(mapRaw, null, 2));
		return;
	}

	console.log('');
	console.log(`🏗️  构建命令 🏗️`);

	for (const [key, value] of [...config.build.entries(), ...Object.entries(config.unusedBuild)]) {
		if (config.build.has(key)) {
			console.log(` ${CSI}38;5;10m✓ ${key}${CSI}0m`);
		} else {
			console.log(` ${CSI}38;5;9m✗ ${key}${CSI}0m`);
		}
		const cmdDump = value.command.map((e) => {
			return `${CSI}3m${JSON.stringify(e)}${CSI}0m`;
		});
		console.log(`     命令: ${cmdDump.join(' ')}`);
		console.log(`     工作目录: ${CSI}3m${JSON.stringify(value.cwd)}${CSI}0m`);
		if (Object.keys(value.env).length > 0) {
			console.log(`     额外环境变量:`);
			for (const [key, val] of Object.entries(value.env)) {
				console.log(`       ${key}: ${CSI}2m${JSON.stringify(val)}${CSI}0m`);
			}
		} else {
			console.log(`     额外环境变量: 无`);
		}
		console.log('');
	}

	console.log(`🧹 清理目录 🧹`);
	for (const path of config.clean) {
		console.log(` ${CSI}38;5;10m-${CSI}0m ${path}`);
	}

	console.log('');
	console.log(`🔍 附加路径 🔍`);
	for (const path of config.additionalPaths) {
		console.log(` ${CSI}38;5;10m-${CSI}0m ${path}`);
	}

	const cfgObj = new ProjectConfig(projectRoot, undefined, logger);
	const cfgInfo = cfgObj.getJsonConfigInfo('commands');

	console.log('');
	console.log(`🔧 配置文件信息 🔧`);
	if (cfgInfo.project.exists) {
		console.log(`  项目: ${cfgInfo.project.path}`);
	} else {
		console.log(`  项目: (不存在) ${CSI}2m${cfgInfo.project.path}${CSI}0m`);
	}
	if (cfgInfo.rig.exists) {
		console.log(`  脚手架: ${realpathSync(cfgInfo.rig.path)}`);
	} else {
		console.log(`  脚手架: (不存在) ${CSI}2m${cfgInfo.rig.path}${CSI}0m`);
	}

	console.log('');
	console.log('');
}
