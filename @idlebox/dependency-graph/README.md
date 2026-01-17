# wrapper around [dependency-graph](https://www.npmjs.com/package/dependency-graph)

### 功能

* 运行（启动）状态管理
* 可以用于调试的信息输出
* 添加节点无顺序要求
* 节点状态标记


### 基础依赖关系图

```typescript

```

### 运行依赖关系图

```typescript
import { JobGraphBuilder, Job } from '@idlebox/dependency-graph';

class CleanJob extends Job {
	async override async _execute() {}
}
class BuildJob extends Job {
	async override async _execute() {}
}
class PublishJob extends Job {
	async override async _execute() {}
}

const graph = new JobGraphBuilder();
graph.addNode(new CleanJob("清理", []));
graph.addNode(new BuildJob("编译", ["清理"]));
graph.addNode(new PublishJob("发布", ["编译"]));

await graph.startup();
```
