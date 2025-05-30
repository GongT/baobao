import { expect } from 'chai';
import { suite_simple } from './lib.js';

describe('handle error condition', () => {
	suite_simple('flag not accept value', ['--pager=abc'], (reader) => {
		expect(() => reader.flag('--pager')).to.throw();
	});

	suite_simple('not determined is ok', ['--pager', 'abc'], (reader) => {
		expect(() => reader.flag('--pager')).to.not.throw();
		expect(reader.flag('--pager')).to.equal(1);
	});

	suite_simple("can't disambiguates flag and option", ['--flag=1', '--flag'], (reader) => {
		expect(() => reader.flag('--flag')).to.throw();
		expect(() => reader.single('--flag')).to.throw();
	});

	suite_simple('more provide to single option', ['--work-tree=/tmp', '-w=/tmp'], (reader) => {
		expect(() => reader.single(['--work-tree', '-w'])).to.throw();
	});

	suite_simple('invalid options', ['aaa'], (reader) => {
		expect(() => reader.single('-mistake')).to.throw();
		expect(() => reader.single('---mistake')).to.throw();
		expect(() => reader.range(-1)).to.throw();
	});

	suite_simple('prevent reuse value', ['--flag', 'aaa'], (reader) => {
		expect(reader.at(0)).to.equal('aaa');
		expect(() => reader.single('---flag')).to.throw();
	});
});
