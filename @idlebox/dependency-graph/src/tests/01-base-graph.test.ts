import { logger } from '@idlebox/logger';
import { expect } from 'chai';
import { SimpleDependencyBuilder, SimpleNode } from '../common/simple-graph.js';
import './test-lib.js';

describe('SimpleDependencyGraph', () => {
	it('very basic works', () => {
		const dep = SimpleDependencyBuilder.from(
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

		console.error(dep.debugFormatGraph());
		console.error(dep.debugFormatSummary());
	});
});

describe('add & remove', () => {
	it('#add', () => {
		const builder = new SimpleDependencyBuilder(logger);
		builder.addNode(new SimpleNode('a', ['b'], {}));
		builder.addNode(new SimpleNode('b', ['c'], {}));
		builder.addNode(new SimpleNode('c', [], {}));
		expect(builder.finalize().size).to.be.equal(3);
	});
	it('#delete', () => {
		const builder = new SimpleDependencyBuilder(logger);
		builder.addNode(new SimpleNode('a', ['b'], {}));
		builder.addNode(new SimpleNode('b', ['c'], {}));
		builder.addNode(new SimpleNode('c', [], {}));
		builder.removeNode('b');
		expect(builder.finalize().size).to.be.equal(2);
	});
	it('#delete without dependency', () => {
		const builder = new SimpleDependencyBuilder(logger);
		builder.addNode(new SimpleNode('a', ['b'], {}));
		builder.addNode(new SimpleNode('b', ['c'], {}));
		builder.addNode(new SimpleNode('c', [], {}));
		builder.removeNode('b', false);
		expect(() => builder.finalize()).to.throw('does not exist');
	});
});
