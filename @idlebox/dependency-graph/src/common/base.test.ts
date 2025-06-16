import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { expect } from 'chai';
import { SimpleDependencyGraph } from './base.js';

createRootLogger('test', EnableLogLevel.verbose);

describe('SimpleDependencyGraph', () => {
	it('works', () => {
		const dep = SimpleDependencyGraph.from<any>(
			[
				{
					name: 'aaa',
					dependencies: ['bbb', 'ccc'],
					data: {},
				},
				{
					name: 'bbb',
					dependencies: ['ccc', 'ddd'],
					data: {},
				},
				{
					name: 'ccc',
					dependencies: ['ddd'],
					data: {},
				},
				{
					name: 'ddd',
					dependencies: [],
					data: {},
				},
				{
					name: 'eee',
					dependencies: [],
					data: {},
				},
			],
			logger,
		);

		console.error(dep);
	});

	it('fail if circular dependency', () => {
		expect(() => {
			SimpleDependencyGraph.from<any>(
				[
					{
						name: 'aaa',
						dependencies: ['bbb'],
						data: {},
					},
					{
						name: 'bbb',
						dependencies: ['ccc'],
						data: {},
					},
					{
						name: 'ccc',
						dependencies: ['aaa'],
						data: {},
					},
				],
				logger,
			);
		}).to.throw('Dependency Cycle');
	});

	it('fail if missing dependency', () => {
		expect(() => {
			SimpleDependencyGraph.from<any>(
				[
					{
						name: 'aaa',
						dependencies: ['bbb'],
						data: {},
					},
					{
						name: 'ccc',
						dependencies: ['aaa'],
						data: {},
					},
				],
				logger,
			);
		}).to.throw('Node does not exist');
	});
});
