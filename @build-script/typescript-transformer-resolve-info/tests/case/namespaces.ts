import * as ManyType from '../decl/manyType';
import * as ManyValue from '../decl/manyValue';
import * as Arr from '../decl/valueArray';
import * as Fn from '../decl/function';

const AV: ManyType.Mixed = !!(ManyValue.A + Arr.NumberArr[1] + Fn.testNamedFunction());

console.log(AV);
