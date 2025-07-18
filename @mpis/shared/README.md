# 构建（监视）启动与完成事件标准协议

#### 这是什么
这是一个自用协议，规定各种转译、构建启动和完成时发送事件

#### 为什么
我的项目并没有特别复杂，不希望有一个几十上百万行的屎山来管理我几百行的代码。并且我需要每一个构建步骤都把自己的输出写到硬盘上，以便快速确定到底在哪一步出了问题。

对于非watch模式，这很简单，只需要写一个shell脚本依次运行命令，每个命令本来就会把输出写到硬盘上，哪个命令出错直接退出即可。

但是，更多的时候我需要watch模式。首个出错的信息是最重要的，我需要一个通用的办法在前一步watch出错时抑制后续步骤的运行，所以需要知道它到底成功执行了没有。

于是就有了这个协议。

```json
{
	"__brand__": "BPCM",
	"event": "start", // success failed
	"title": "some-build-command",
	"pid": process.pid,
	// "output": ""
}
```
