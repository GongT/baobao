import { expect } from 'chai';
import { suite_simple } from './lib.js';

describe('sub command', () => {
	suite_simple('works', ['--flag', 'some', '--flag', 'action', 'arg1', 'arg2'], (reader) => {
		expect(reader.flag('--flag')).to.equal(2);

		const sub = reader.command(['some', 'action']);
		expect(sub).have.property('value', 'some');

		expect(sub?.flag('--flag')).to.equal(2);
		expect(sub?.at(0)).to.equal('action');
	});

	suite_simple('undefined if not enough length', ['--flag'], (reader) => {
		expect(reader.command(['notfound'])).to.be.undefined;
	});

	suite_simple('can use after range', ['aaa', 'bbb', 'ccc', 'ddd'], (reader) => {
		expect(reader.at(0)).to.equal('aaa');
		expect(reader.at(1)).to.equal('bbb');
		expect(reader.command(['ccc'])).have.property('value', 'ccc');
		expect(reader.at(3)).to.equal('ddd');
		expect(() => reader.at(2)).to.throw();
	});

	suite_simple('can use chained commands', ['aaa', 'bbb', 'ccc', 'ddd', 'eee'], (reader) => {
		const s1 = reader.command(['aaa']);
		expect(s1).have.property('value', 'aaa');

		const s2 = s1?.command(['bbb']);
		expect(s2).have.property('value', 'bbb');

		const s3 = s2?.command(['ccc']);
		expect(s3).have.property('value', 'ccc');

		const s4 = s3?.command(['ddd']);
		expect(s4).have.property('value', 'ddd');

		expect(s4?.at(0)).to.equal('eee');
	});

	suite_simple('range command range command range', ['aaa', 'bbb', 'ccc', 'ddd', 'eee'], (reader) => {
		expect(reader.at(0)).to.equal('aaa');

		const s1 = reader.command(['bbb']);
		expect(s1).have.property('value', 'bbb');
		expect(s1?.at(0)).to.equal('ccc');

		const s2 = s1?.command(['ddd']);
		expect(s2).have.property('value', 'ddd');
		expect(s2?.at(0)).to.equal('eee');
	});
});

/*
describe('#command()', () => {
	it(
		'ok',
		times(3, () => {
			const { sub } = testSub();
			expect(sub).is.instanceOf(ApplicationArguments).and.have.property('value', 'fetch');
		}),
	);
	it('undefined if not match', () => {
		const reader = test(args);
		const sub = reader.command(['a', 'b', 'c']);
		expect(sub).to.be.equal(undefined);
	});

	it(
		'#flag()',
		times(3, () => {
			const { sub } = testSub();
			expect(sub.flag('--all')).to.equal(1);
			expect(sub.flag('--no-pager')).to.equal(1);
		}),
	);
	it(
		'range access',
		times(3, () => {
			const { sub } = testSub();
			expect(sub.at(0)).to.equal('origin');
			expect(sub.at(1)).to.be.undefined;
			expect(sub.range(0, 1)).to.eql(['origin']);
		}),
	);
	it(
		'#range()',
		times(3, () => {
			const { sub } = testSub();
			const reader = test(args);
			expect(() => sub.range(0, 2)).to.throw();
			expect(sub.range(1, 123)).to.empty;
			expect(() => reader.range(0, 1)).to.throw();
		}),
	);
});
*/
