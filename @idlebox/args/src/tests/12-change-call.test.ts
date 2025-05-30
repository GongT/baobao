import { expect } from 'chai';
import { suite_simple } from './lib.js';

describe('change call site', () => {
	suite_simple('fail if flag change to option', ['--flag', '--flag'], (reader) => {
		expect(reader.flag('--flag')).to.equal(2);
		expect(() => reader.single('--flag')).to.throw();
	});

	suite_simple('fail if option change to flag', ['--option=1', '--option', '2'], (reader) => {
		expect(reader.multiple('--option')).to.eql(['1', '2']);
		expect(() => reader.flag('--option')).to.throw();
	});

	suite_simple('fail if swap order', ['--option=1', '--option', '2'], (reader) => {
		expect(reader.multiple(['--option', '-o'])).to.eql(['1', '2']);
		expect(() => reader.multiple(['-o', '--option'])).to.throw();
	});

	suite_simple('fail if mixed string and array', ['--option=1', '--flag'], (reader) => {
		expect(reader.single('--option')).to.equal('1');
		expect(() => reader.single(['--option'])).to.throw();

		expect(reader.flag(['--flag'])).to.equal(1);
		expect(() => reader.flag('--flag')).to.throw();
	});

	suite_simple('fail if range conflict', ['1', '2', '3', '4', '5', '6'], (reader) => {
		expect(reader.range(2, 2)).to.eql(['3', '4']);
		expect(() => reader.at(2)).to.throw(); // inner contain
		expect(() => reader.range(2, 3)).to.throw(); // outer contain
		expect(() => reader.range(1, 2)).to.throw(); // left conflict
		expect(() => reader.range(3, 2)).to.throw(); // right conflict
	});

	suite_simple('negative can reuse (single)', ['--flag', '--no-flag', '--no-flag'], (reader) => {
		expect(reader.flag('--flag')).to.equal(-1);
		expect(reader.flag('--no-flag')).to.equal(2);
	});

	suite_simple('negative can reuse (array)', ['--flag', '--no-flag', '--no-flag'], (reader) => {
		expect(reader.flag(['--flag'])).to.equal(-1);
		expect(reader.flag(['--no-flag'])).to.equal(2);
	});

	suite_simple('fail if mixed negative reuse', ['--flag', '--no-flag', '--no-flag'], (reader) => {
		expect(reader.flag('--flag')).to.equal(-1);
		expect(() => reader.flag(['--no-flag'])).to.throw();
	});
});
