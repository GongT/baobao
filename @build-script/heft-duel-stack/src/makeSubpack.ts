import { resolve } from 'path';
import { RushStackConfig } from '@build-script/rushstack-config-loader';
import { writeFileIfChangeSync } from '@idlebox/node';
import { IMyOptions, PLUGIN_NAME } from './plugin';

import type TS from 'typescript';
import type { IBuildStageContext, IPostBuildSubstage, HeftConfiguration, HeftSession } from '@rushstack/heft';

export function applyAppendExtension(
	heftSession: HeftSession,
	heftConfiguration: HeftConfiguration,
	config: RushStackConfig,
	_options: IMyOptions
) {
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
