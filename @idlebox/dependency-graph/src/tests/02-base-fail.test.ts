import { logger } from '@idlebox/logger';
import { expect } from 'chai';
import { describe } from 'mocha';
import { SimpleDependencyBuilder, SimpleNode } from '../common/simple-graph.js';

describe('fail', () => {
	it('throw if duplicate', () => {
		expect(() => {
			const b = new SimpleDependencyBuilder(logger);
			b.addNode(new SimpleNode('a', [], {}));
			b.addNode(new SimpleNode('a', [], {}));
			b.finalize();
		}).to.throw('duplicate node');
	});

	it('throw if missing', () => {
		expect(() => {
			const b = new SimpleDependencyBuilder(logger);
			b.addNode(new SimpleNode('a', ['b'], {}));
			b.finalize();
		}).to.throw('does not exist');
	});

	it('found circular dependency', () => {
		expect(() => {
			SimpleDependencyBuilder.from(
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

	it('missing dependency', () => {
		expect(() => {
			SimpleDependencyBuilder.from(
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
