# 分情况加载 [source-map-support](https://www.npmjs.com/package/source-map-support)

以下情况跳过加载:
* `inspector.url()` 返回非空
* execArgv包含“--inspect”、“--inspect-brk”、“--enable-source-maps”
* DISABLE_SOURCE_MAP 非空

其余情况下 `install()` 就是 `source-map-support` 的导出

### usage

```ts
import { install } from '@idlebox/source-map-support';
install();

// ... or ...
import '@idlebox/source-map-support/register';
```
