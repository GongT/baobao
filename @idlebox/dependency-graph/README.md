# wrapper around [dependency-graph](https://www.npmjs.com/package/dependency-graph)

### 功能

* 运行（启动）状态管理
* 可以用于调试的信息输出
* 添加节点无顺序要求
* 节点状态标记


### 基础依赖关系图

```typescript
import { SimpleDependencyGraph } from '@idlebox/dependency-graph';

const graph = SimpleDependencyGraph.from([
	{
		name: 'a',
		dependencies: ['b', 'c'],
		reference: {}
	},
	{
		name: 'b',
		dependencies: ['c'],
		reference: {}
	},
	{
		name: 'c',
		dependencies: ['a'],
		reference: {}
	}
]);
```
