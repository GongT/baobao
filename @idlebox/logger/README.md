# 日志工具

## 全局logger对象
```ts
import { logger, createRootLogger } from "@idlebox/logger";

createRootLogger('myapp'); // 如果tag为空，则不受“DEBUG”环境变量控制，无条件显示；DEBUG_LEVEL仍然生效
logger.log`debug message`;
```

## 模块logger对象
```ts
import { createLogger } from "@idlebox/logger";

const logger = createLogger('myapp:module');
logger.log`debug message`;
```

### 环境变量

|环境变量|描述|默认值|
|:---|:---|:---|
|DEBUG|调试模式，格式类似“模块1,模块2,模块3”，也可以用空格。底层调用[debug](https://www.npmjs.com/package/debug)包实现判断 |``|
|DEBUG_LEVEL|日志级别(verbose, debug, info, "", warn, error)|``|
|NO_COLOR|禁用颜色，任何非空的值都为真|``|
|NODE_DISABLE_COLORS|同上，但只支持“1”|0|
|FORCE_COLOR|强制启用颜色，任何非空的值都为真|``|

注意: 如果命令行存在`--verbose`、`-d, --debug`参数，会覆盖`DEBUG_LEVEL`环境变量，两个`-d`=`--verbose`，不支持`-v`。

### 可用命令

```ts
const veryLongString = "This is a very long string that might be truncated in logs";
logger.log`don't truncate: long<${veryLongString}>`;
```

|命令|描述|
|:---|:---|
|long|不要省略超长字符串、数组|
|inspect| 使用util.inspect()来格式化对象 |
|stripe| 单行显示（转义回车等字符） |
|list|以列表形式展示，要求参数为Iterable对象，且结果为`string`或`[string, string]`（也可以是实现`toString()`的对象）|
|commandline|优化显示命令行参数|
|relative|路径转换为相对于当前工作目录|
|printable|删除非可打印字符（序列）|
