import { expect } from 'chai';
import { before, describe } from 'mocha';
import type { TToken } from '../library/token.js';
import { tokenize } from '../tools/tokenize.js';
import { TokenKind } from '../types.js';

const args = [
	'value', // 1
	'--verbose', // 2
	'-in-valid', // 3
	'---invalid', // 4
	'-abc=xyz', // 5 6 7
	'value', // 8
	'--', // no
	'value', // 9
	'--', // 10
	'--value', // 11
	'-flag=value', // 12
];

describe('tokenize', () => {
	let tokens: TToken[];
	const total = 8;

	before(() => {
		const fakeParser = {
			arguments: [],
		};
		tokens = tokenize(args, fakeParser as any);
	});
	it('should consume all arguments', () => {
		expect(tokens).to.have.lengthOf(13);
	});

	it('find 1 value', () => {
		expect(tokens[0].valueOf()).to.deep.equal({
			index: 0,
			kind: TokenKind.Value,
			value: 'value',
			total,
		});
	});
	it('find 2 flag', () => {
		expect(tokens[1].valueOf()).to.deep.equal({
			index: 1,
			kind: TokenKind.Flag,
			name: 'verbose',
			short: false,
			total,
		});
	});
	it('find 3 value', () => {
		expect(tokens[2].valueOf()).to.deep.equal({
			index: 2,
			kind: TokenKind.Value,
			value: '-in-valid',
			total,
		});
	});
	it('find 4 value', () => {
		expect(tokens[3].valueOf()).to.deep.equal({
			index: 3,
			kind: TokenKind.Value,
			value: '---invalid',
			total,
		});
	});
	it('find 5 flag', () => {
		expect(tokens[4].valueOf()).to.deep.equal({
			index: 4,
			kind: TokenKind.Flag,
			name: 'a',
			short: true,
			total,
		});
	});
	it('find 6 flag', () => {
		expect(tokens[5].valueOf()).to.deep.equal({
			index: 5,
			kind: TokenKind.Flag,
			name: 'b',
			short: true,
			total,
		});
	});
	it('find 7 both', () => {
		expect(tokens[6].valueOf()).to.deep.equal({
			index: 6,
			kind: TokenKind.Both,
			name: 'c',
			value: 'xyz',
			short: true,
			total,
		});
	});
	it('find 8 value', () => {
		expect(tokens[7].valueOf()).to.deep.equal({
			index: 7,
			kind: TokenKind.Value,
			value: 'value',
			total,
		});
	});

	it('find 9 -- dash', () => {
		expect(tokens[8].valueOf()).to.deep.equal({
			index: 8,
			kind: TokenKind.DoubleDash,
			total,
		});
	});

	for (let i = 1; i < 5; i++) {
		const value = args[i + args.indexOf('--')];
		it(`extras at ${i} will be ${value}`, () => {
			expect(tokens[i + total].valueOf()).to.deep.equal({
				index: i + total,
				kind: TokenKind.Value,
				value,
				total,
			});
		});
	}
});
