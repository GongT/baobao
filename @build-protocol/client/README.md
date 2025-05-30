# 构建协议客户端

### CLI

##### 标准输入模式

> build-protocol-client --stdin [--start <开始>] --finish <完成> [--success <成功>] [--error <错误>]

* `--start` <开始>：可选，匹配编译开始时的输出内容。如果不设置，则不会发出开始事件。
* `--finish` <完成>：匹配行，成功则发送成功或失败事件。必须设置。
* `--error` <失败>：二选一，匹配从上次完成（不含）直到本次完成（包含）的输出内容，匹配到则认为成功。
* `--success` <成功>：二选一，匹配从上次完成（不含）直到本次完成（包含）的输出内容，匹配到则认为成功。

同时匹配或同时没有匹配到 `--error` 和 `--success` 时，优先认定为发生了错误。    
但如果输入被关闭（例如前面的进程结束），则在没有匹配到 `--error` 时候认定为成功。且即使没有匹配到 `--finish`，也会发送完成事件。

所有字符串都是正则表达式，带有flag=`umi`，可以设置对应的 `--xxx-fixed yyyy` ，只进行字符串搜索。

例如：

```bash
tsc -p . -w | \
build-protocol-client --stdin \
	--success "Found 0 errors" \
	--finish "Watching for file changes\\." \
	--start "Starting (incremental)? compilation"
```

##### 运行命令并同时监听stdout和stderr
> build-protocol-client [--start <开始>] --finish <完成> [--success <成功>] [--error <错误>] -- <命令> [<参数>...]

* `--` 必须存在，后面的内容会被认定为命令和参数。
* 其他选项见上方说明


### API

```ts
import { BuildProtocolClient } from '@build-protocol/client';

const protocol = BuildProtocolClient();

await protocol.connect();
