///<reference types="node"/>

import { fatalError } from './cmd-loader';
import { isArrayOfString } from './common/func';

export interface ExecFunc {
	(done: (error?: any) => void): Promise<void>;
	displayName?: string;
}

export interface MapLike<T> {
	[key: string]: T;
}

export interface IPluginDefine {
	file: string;
	args: string[];
}

export interface IMyProjectJson {
	load: (string | IPluginDefine)[];
	alias: MapLike<string | string[]>;
	command: MapLike<{
		title?: string;
		after?: string[];
		run: string[];
	}>;
}

export interface IMyProjectJsonParsed {
	alias: Map<string, string[]>;
	job: Map<string, {
		title: string;
		after: Set<string>;
		preRun: Set<string>;
		postRun: Set<string>;
		run: Set<string>;
	}>;
}

export function rectLoadDefine(arr: (IPluginDefine | string)[]): IPluginDefine[] {
	return arr.map((item, i) => {
			if (typeof item === 'string') {
				return { file: item, args: [] };
			} else {
				if (!item.file) {
					fatalError(`file field is required, when init plugin @${i}.`);
				}
				if (item.args && !isArrayOfString(item.args)) {
					fatalError(`args must string[], when init plugin "${item.file}".`);
				}
				if (!item.args) {
					item.args = [];
				}
				return item;
			}
		},
	);
}
