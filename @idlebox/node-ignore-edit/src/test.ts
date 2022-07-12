import 'source-map-support/register';
import { IIgnoreFile, parse, stringify, unscoped } from './api';

let failed = 0;
const t1 = '### t1';
const t2 = '### t2';
const l1 = 'a/f1';
const l2 = 'a/f2';
const l3 = 'a/f3';
// const l4 = 'a/*';
// const l5 = '!a/b';

function test(input: string[], output: string[], action: (value: IIgnoreFile) => void) {
	const data = parse(input.join('\n'));
	action(data);
	const result = stringify(data);

	if (result.trim() !== output.join('\n').trim()) {
		console.error('测试失败:', action.name);
		console.error('===================== 期望\n%s', output.join('\n').trim());
		console.error('===================== 实际\n%s', result.trim());
		failed++;
	} else {
		console.log('测试成功:', action.name);
	}
}

test([t1, l1, l2], [t1, l1, l3, l2], function push顺序(v) {
	v.t1.push(l1, l3);
});
test([t1, l1, l2], [t1, l2, l1], function push顺序2(v) {
	v.t1.push(l2, l1);
});

test([t1, l1, l2], [t1, l1, l3, l2], function unshift顺序(v) {
	v.t1.unshift(l1, l3);
});
test([t1, l1, l2], [t1, l2, l1], function unshift顺序2(v) {
	v.t1.unshift(l2, l1);
});

test([t1, l1, l2], [l1, l2, '', t1, l1, l2, '', t2, l1, l2], function 新增tag(v) {
	v[unscoped].push(l1, l2);
	v.t2.push(l1, l2);
});

test([t1, l1], [t1, l1, l2], function 重复添加(v) {
	v.t1.push(l2, l2);
	v.t1.push(l2);
});

test(['', '', t1, '', '', l1, '', '', l2, l3, ''], [t1, l1, '', l2, l3], function 删除多余空白() {});

test([t1, l1], [t1, l1, l2], function 重复添加(v) {
	v.t1.push(l2, l2);
	v.t1.push(l2);
});

process.exit(failed);
