import { ObjectPath } from '@idlebox/common';
import type { IMyLogger } from '@idlebox/logger';
import type { ErrorObject } from './error-collecter.js';

type Primitive = undefined | boolean | string | number;
type KeyType = string | number;

export class ObjectChecker {
	private readonly object: ObjectPath;

	constructor(
		public readonly logger: IMyLogger,
		public readonly error: ErrorObject,
		object: any,
	) {
		this.object = new ObjectPath(object);
	}

	exists(path: readonly KeyType[]) {
		const exists = this.object.exists(path);
		if (exists) return;

		this.error.emit(`field \`${format_path(path)}\` must exists`);
	}

	not_exists(path: readonly KeyType[]) {
		const exists = this.object.exists(path);
		if (!exists) return;

		const got = this.object.get(path);
		this.error.emit(`field \`${format_path(path)}\` must not exists, got ${JSON.stringify(got)}`);

		this.object.set(path, undefined);
	}

	equals(path: readonly KeyType[], want: Primitive) {
		if (want === undefined) {
			return this.not_exists(path);
		}
		const data = this.object.get(path);
		if (data === want) return;

		this.error.emit(`field \`${format_path(path)}\` must be ${JSON.stringify(want)}, got ${JSON.stringify(data)}`);
		this.object.set(path, want);
	}

	hasField(path: readonly KeyType[]) {
		const data = this.object.get(path);
		if (data === undefined) {
			this.error.emit(`missing required field \`${format_path(path)}\``);
		}
	}
}

function format_path(path: readonly KeyType[]): string {
	return (
		path[0] +
		path
			.slice(1)
			.map((e) => `[${JSON.stringify(e)}]`)
			.join('')
	);
}
