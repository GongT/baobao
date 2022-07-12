import { readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { md5, writeFileIfChangeSync } from '@idlebox/node';
import { IMyOptions, PLUGIN_NAME } from './plugin';

import type TS from 'typescript';
import type { IBuildStageContext, IPostBuildSubstage, HeftConfiguration, HeftSession } from '@rushstack/heft';
declare const global: any;

function monkeyPatchBuilder(file: string, exports: any) {
	const patchFile = readFileSync(resolve(__dirname, 'monkeyPatch.js'));
	const hash = md5(patchFile);
	const sig = `/* __MonkeyPatch__:${hash}\n`;

	let fileData = readFileSync(file, 'utf-8');

	if (fileData.includes(sig)) {
		return;
	}

	console.log(`[monkey-patch] modify ${file}`);
	const found = fileData.indexOf('/* __MonkeyPatch__:');
	if (found > 0) {
		fileData = fileData.slice(0, found);
	}
	fileData = fileData.trimEnd() + '\n';
	fileData += sig + patchFile;
	writeFileSync(file, fileData);

	delete require.cache[file];
	Object.assign(exports, require(file));
}

// function monkeyPatchResolver(Class: Function) {
// 	const original = Class.prototype._resolveToolPackagesInnerAsync;
// 	if (Class.prototype._tryResolveToolPackageAsync.length !== 3) {
// 		throw new Error('heft change internal method, see ToolPackageResolver.ts update');
// 	}
// 	Class.prototype._resolveToolPackagesInnerAsync = async function _monkeyPatch_resolveToolPackagesInnerAsync(
// 		this: any,
// 		heftConfiguration: HeftConfiguration,
// 		terminal: HeftConfiguration['globalTerminal']
// 	) {
// 		const oReturn = await original.apply(this, arguments);

// 		oReturn.typeScriptPackagePath = await this._tryResolveToolPackageAsync(
// 			'ttypescript',
// 			heftConfiguration,
// 			terminal
// 		);

// 		return oReturn;
// 	};
// }

export function applyAppendExtension(
	heftSession: HeftSession,
	heftConfiguration: HeftConfiguration,
	config: RushStackConfig,
	_options: IMyOptions
) {
	for (const file of Object.keys(require.cache)) {
		// if (file.endsWith('ToolPackageResolver.js')) {
		// 	monkeyPatchResolver(require.cache[file]!.exports.ToolPackageResolver);
		// }
		if (file.endsWith('TypeScriptBuilder.js')) {
			monkeyPatchBuilder(file, require.cache[file]!.exports);
		}
	}

	heftSession.hooks.build.tap(PLUGIN_NAME, (build: IBuildStageContext) => {
		build.hooks.postBuild.tap(PLUGIN_NAME, (postBuild: IPostBuildSubstage) => {
			postBuild.hooks.run.tap(PLUGIN_NAME, function createPackageJson() {
				const dist = { cjs: '', esm: '' };
				const tsconfig = config.tsconfig();
				const ts: typeof TS = config.require('typescript');
				if (tsconfig.options.module === ts.ModuleKind.CommonJS) {
					dist.cjs = tsconfig.options.outDir;
				} else if (
					tsconfig.options.module! >= ts.ModuleKind.ES2015 &&
					tsconfig.options.module! <= ts.ModuleKind.ESNext
				) {
					dist.esm = tsconfig.options.outDir;
				}

				const tscfg = config.typescript();
				if (tscfg.additionalModuleKindsToEmit) {
					if (!dist.esm) {
						const f = tscfg.additionalModuleKindsToEmit.find(
							(e) => e.moduleKind === 'es2015' || e.moduleKind === 'esnext'
						)?.outFolderName;
						if (f) dist.esm = resolve(heftConfiguration.buildFolder, f);
					}
					if (!dist.cjs) {
						const f = tscfg.additionalModuleKindsToEmit.find(
							(e) => e.moduleKind === 'commonjs'
						)?.outFolderName;
						if (f) dist.cjs = resolve(heftConfiguration.buildFolder, f);
					}
				}

				if (dist.cjs) {
					writeFileIfChangeSync(resolve(dist.cjs, 'package.json'), JSON.stringify({ type: 'commonjs' }));
				}
				if (dist.esm) {
					writeFileIfChangeSync(resolve(dist.esm, 'package.json'), JSON.stringify({ type: 'module' }));
				}
			});
		});
	});
}
