import { basename, resolve } from 'path';
import { loadHeftConfig } from '@build-script/rushstack-config-loader';
import { applyAppendExtension } from './appendExtension';
import { applyCreateIndex } from './createIndex';
import { applyAutoTestImport } from './test-import';

import type { HeftConfiguration, HeftSession } from '@rushstack/heft';
// export const optionsSchema = loadJsonFileSync(resolve(__dirname, '../assets/schema.json'));

export const pluginName = require(resolve(__dirname, '../package.json')).name;
export const PLUGIN_NAME = basename(pluginName);

export interface IMyOptions {
	project?: string;
	outFile?: string;
	excludes?: string[];
	filterFile?: string;
}

export function apply(heftSession: HeftSession, heftConfiguration: HeftConfiguration, options: IMyOptions = {}): void {
	const config = loadHeftConfig(heftConfiguration);

	process.env.HEFT_DUEL_STACK = require.resolve('../package.json');
	require(process.env.HEFT_DUEL_STACK);

	applyCreateIndex(heftSession, heftConfiguration, config, options);
	applyAppendExtension(heftSession, heftConfiguration, config, options);
	applyAutoTestImport(heftSession, heftConfiguration, config, options);
}
