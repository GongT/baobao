import { expect } from 'chai';
import { suite_simple, suite_steps } from './lib.js';

const arg_test = ['--argument', 'value', '--flag', '-abc=xyz', '--neg', 'arg1', '--no-neg', 'arg2', 'arg3'];

const arg_dbl_dash = ['--', 'arg4', '--flag', 'arg5'];

describe('basic usage', () => {
	suite_steps(arg_test, (it) => {
		it('#single works', (reader) => {
			expect(reader.single('--argument')).to.equal('value');
			expect(reader.single('--missing1')).to.equal(undefined);
		});

		it('can explode short flag', (reader) => {
			expect(reader.flag(['-a', '-b'])).to.equal(2);
			expect(reader.single('-c')).to.equal('xyz');
		});

		it('#flag works', (reader) => {
			expect(reader.flag('--flag')).to.equal(1);
			expect(reader.flag('--missing2')).to.equal(0);
		});

		it('#flag support negative', (reader) => {
			expect(reader.flag('--neg')).to.eql(0);
		});

		it('#range works', (reader) => {
			expect(reader.range(0)).to.eql(['arg1', 'arg2', 'arg3']);
		});
		it('all consumed', (reader) => {
			expect(reader.unused()).to.eql([]);
		});
	});

	suite_simple('#at() works', arg_test.concat(arg_dbl_dash), (reader) => {
		expect(() => reader.at(-1)).to.throw();
		expect(reader.at(0)).to.equal('arg4');
		expect(reader.at(1)).to.equal('--flag');
		expect(reader.at(2)).to.equal('arg5');

		expect(reader.at(999)).to.equal(undefined);
	});

	suite_simple('works with --', arg_test.concat(arg_dbl_dash), (reader) => {
		expect(reader.single('--argument')).to.equal('value');
		expect(reader.single('--missing1')).to.equal(undefined);

		expect(reader.flag(['-a', '-b'])).to.equal(2);
		expect(reader.single('-c')).to.equal('xyz');

		expect(reader.flag('--flag')).to.equal(1);
		expect(reader.flag('--missing2')).to.equal(0);

		expect(reader.flag('--neg')).to.eql(0);

		expect(reader.range(0)).to.eql(['arg4', '--flag', 'arg5']);
		expect(reader.unused()).to.eql(['arg1', 'arg2', 'arg3']);
	});

	suite_simple("won't mistake matching flags", ['-in-valid', '---invalid'], (reader) => {
		expect(() => reader.flag('-in-valid')).to.throw();
		expect(() => reader.flag('---invalid')).to.throw();
		expect(reader.range(0)).to.eql(['-in-valid', '---invalid']);
	});

	suite_steps(['--flag', 'value', '--can-not=0', '--can-not'], (it) => {
		it('want disambiguates flags1', (reader) => {
			expect(reader.single('--flag')).to.equal('value');
		});
		it('want disambiguates flags2', (reader) => {
			expect(reader.flag('--flag')).to.equal(1);
		});
	});
});
