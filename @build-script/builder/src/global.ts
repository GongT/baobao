///<reference types="node"/>

import { isArrayOfString } from './common/func';

export interface IBuildContext {
	registerAlias(name: string, command: string, args?: ReadonlyArray<string>): void;
	prefixAction(command: string, jobs: string[]): void;
	addAction(command: string, jobs: ReadonlyArray<string>, dependency?: ReadonlyArray<string>): void;
	postfixAction(command: string, jobs: string[]): void;
	readonly args: ReadonlyArray<string>;
}

export interface ExecFunc {
	(done: (error?: any) => void): void;
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
		serial?: boolean;
		title?: string;
		after?: string[];
		run: string[];
	}>;
}

export interface IMyProjectJsonParsed {
	alias: Map<string, string | string[]>;
	job: Map<
		string,
		{
			serial: boolean;
			title: string;
			after: Set<string>;
			preRun: Set<string>;
			postRun: Set<string>;
			run: Set<string>;
			createByPlugin: boolean;
		}
	>;
	scriptsJob: Map<string, string>;
}

export function rectLoadDefine(arr: (IPluginDefine | string)[]): IPluginDefine[] {
	return arr.map((item, i) => {
		if (typeof item === 'string') {
			return { file: item, args: [] };
		} else {
			if (!item.file) {
				throw new Error(`file field is required, when init plugin @${i}.`);
			}
			if (item.args && !isArrayOfString(item.args)) {
				throw new Error(`args must string[], when init plugin "${item.file}".`);
			}
			if (!item.args) {
				item.args = [];
			}
			return item;
		}
	});
}
