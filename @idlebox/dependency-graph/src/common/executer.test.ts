import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setTimeout } from 'node:timers/promises';
import { ExecuterDependencyGraph } from './executer.js';

createRootLogger('test', EnableLogLevel.verbose);

function initialize(name: string, success = true) {
	return async () => {
		console.error(`[${name}] initialize started`);
		await setTimeout(Math.random() * 100 + 50);
		console.error(`[${name}] initialize completed`);
		if (!success) {
			throw new Error(`[${name}] initialize failed`);
		}
	};
}

describe('ExecuterDependencyGraph', () => {
	it('works', async () => {
		const dep = ExecuterDependencyGraph.from<any>(
			[
				{
					name: 'aaa',
					dependencies: ['bbb', 'ccc'],
					data: {},
					initialize: initialize('aaa'),
				},
				{
					name: 'bbb',
					dependencies: ['ccc', 'ddd'],
					data: {},
					initialize: initialize('bbb'),
				},
				{
					name: 'ccc',
					dependencies: ['ddd'],
					data: {},
					initialize: initialize('ccc'),
				},
				{
					name: 'ddd',
					dependencies: [],
					data: {},
					initialize: initialize('ddd'),
				},
				{
					name: 'eee',
					dependencies: [],
					data: {},
					initialize: initialize('eee'),
				},
			],
			logger,
		);
		console.error(dep);

		await dep.startup();

		console.error(dep);
	}).timeout(Infinity);

	it('handle error', async () => {
		const dep = ExecuterDependencyGraph.from<any>(
			[
				{
					name: 'aaa',
					dependencies: ['bbb', 'ccc'],
					data: {},
					initialize: initialize('aaa'),
				},
				{
					name: 'bbb',
					dependencies: ['ccc', 'ddd'],
					data: {},
					initialize: initialize('bbb'),
				},
				{
					name: 'ccc',
					dependencies: ['ddd'],
					data: {},
					initialize: initialize('ccc'),
				},
				{
					name: 'ddd',
					dependencies: [],
					data: {},
					initialize: initialize('ddd', false),
				},
				{
					name: 'eee',
					dependencies: [],
					data: {},
					initialize: initialize('eee'),
				},
			],
			logger,
		);
		console.error(dep);

		try {
			await dep.startup();
			expect.fail('should throw error');
		} catch (e: any) {
			expect(e.message).to.contains('[ddd] initialize failed');
		}

		console.error(dep);
	}).timeout(Infinity);
});
