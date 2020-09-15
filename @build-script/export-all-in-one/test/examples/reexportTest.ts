export { valueFromSource1 as reexportedValueFromSource1 } from './_source1';

export * from './_source2';

import { valueFromSource3 as temp3 } from './_source3';
export { temp3 as valueFromSource3, temp3 as renamed };

import S4 from './_source4';
export default S4;

export { default as test } from './defaultExport';
