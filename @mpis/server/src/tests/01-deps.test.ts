import { createRootLogger, EnableLogLevel, logger } from '@idlebox/logger';
import { DependencyGraph } from '../common/dependency-graph.js';

createRootLogger('test', EnableLogLevel.verbose);
const dep = new DependencyGraph(logger);

dep.addNode('aaa', ['bbb', 'ccc'], {});
dep.addNode('bbb', ['ccc', 'ddd'], {});
// dep.addNode('bbb', [], {});
dep.addNode('ccc', ['ddd'], {});
// dep.addNode('ccc', [], {});
dep.addNode('ddd', [], {});
dep.addNode('eee', [], {});

dep.finalize();

const r = dep.getNotInitializedLeaf();
console.log(r);

dep.setInitialized('bbb');
dep.setStatus('bbb', true);

dep.setInitialized('ddd');
dep.setStatus('ddd', false);

console.log(dep.debugFormatGraph());
console.log(dep.debugSummary());
