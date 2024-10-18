import { expect } from 'chai';
import { describe, it } from 'mocha';
import 'source-map-support/register.js';
import type { IArgsReaderApi } from '../interface.js';
import { ArgsReader } from '../library/args-reader.js';

function times(t: number, cb: () => void) {
	return () => {
		for (const _ of Array(t).keys()) {
			cb();
		}
	};
}

let reader: ArgsReader;
afterEach(function () {
	if (this.currentTest?.state !== 'passed') {
		console.log('error-ed reader:', reader);
	}
});

describe('common usage', () => {
	reader = new ArgsReader(['--work-tree=/tmp', '--no-pager', 'fetch', '--all', 'origin']);

	describe('#single()', () => {
		it(
			'ok',
			times(3, () => {
				expect(reader.single(['--work-tree', '-w'])).to.equal('/tmp');
			}),
		);
		it('fail change caller', () => {
			expect(() => reader.single(['--work-tree'])).to.throw();
			expect(() => reader.single(['-w', '--work-tree'])).to.throw();
		});
	});

	it(
		'#flag()',
		times(3, () => {
			expect(reader.flag('--no-pager')).to.equal(1);
		}),
	);

	describe('#command()', () => {
		let sub: IArgsReaderApi;
		it(
			'ok',
			times(3, () => {
				sub = reader.command(['fetch', 'clone', 'init'])!;
				expect(sub).is.instanceOf(ArgsReader).and.have.property('value', 'fetch');
			}),
		);
		it("don' fail unmatch", () => {
			const sub = reader.command(['a', 'b', 'c'])!;
			expect(sub).to.be.undefined;
		});

		it(
			'#flag()',
			times(3, () => {
				expect(reader.flag('--all')).to.equal(1);
			}),
		);
		it(
			'range access',
			times(3, () => {
				expect(sub.at(0)).to.equal('origin');
				expect(sub.at(1)).to.be.undefined;
				expect(sub.range(0, 1)).to.eql(['origin']);
			}),
		);
		it(
			'#range()',
			times(3, () => {
				expect(() => sub.range(0, 2)).to.throw();
				expect(sub.range(1, 123)).to.empty;
				expect(() => reader.range(0, 1)).to.throw();
			}),
		);
	});

	describe('split short option', () => {
		it('works', () => {
			reader = new ArgsReader(['-kvvr=abc']);
			expect(reader.flag('-k')).to.equal(1);
			expect(reader.flag('-v')).to.equal(2);
			expect(reader.single('-r')).to.equal('abc');
			expect(reader.unused()).to.be.empty;
		});
	});
});

describe('handle error condition', () => {
	it('flag and option conflict', () => {
		reader = new ArgsReader(['--work-tree=/tmp', '--work-tree', '--some-other']);
		expect(() => reader.multiple(['--work-tree', '-w'])).to.throw();
	});
	it('more provide to single option', () => {
		reader = new ArgsReader(['--work-tree=/tmp', '-w=2']);
		expect(() => reader.single(['--work-tree', '-w'])).to.throw();
	});
	it('positional argument not continues', () => {
		reader = new ArgsReader(['arg1', '--flag', 'arg2']);
		reader.flag('--flag');
		expect(() => reader.range(0)).to.throw();
	});
});
