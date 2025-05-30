import { inspect } from 'node:util';
import { ApplicationArguments } from '../library/reader.app.js';
import type { IArgsReaderApi } from '../types.js';

export function it_always(name: string, cb: () => void) {
	it(name, () => {
		for (const _ of Array(4).keys()) {
			cb();
		}
	});
}

export function suite_simple(name: string, args: readonly string[], tester: (reader: IArgsReaderApi) => void) {
	const reader = new ApplicationArguments(args);
	it_always(name, () => {
		try {
			tester(reader);
		} catch (e) {
			debugger;
			console.log(
				'[simple suite] [%s] after failed, dump the reader:\n',
				name,
				inspect(reader, { colors: true, depth: 10, compact: false }),
			);
			throw e;
		}
	});
}

type RegisterIt = (name: string, fn: (reader: ApplicationArguments) => void) => void;

export function suite_steps(args: readonly string[], register: (it: RegisterIt) => void) {
	const reader = new ApplicationArguments(args);

	register((name, fn) => {
		it_always(name, () => {
			try {
				fn(reader);
			} catch (e) {
				debugger;
				console.log(
					'[test suite] after failed, dump the reader:\n%s',
					inspect(reader, { colors: true, depth: 10, compact: false }),
				);
				throw e;
			}
		});
	});
}
