# pnpm 自定义发布器

**将tar包发布到npm前执行脚本（可以用来处理package.json）**

#### 功能：
1. 调用 `pnpm pack`
2. 将生成的 tar 包解压到临时目录
3. 将 `node_modules` 链接到临时目录
4. 运行 `pnpm run prepublishHook`
5. 重新打包
6. 运行 `pnpm publish xxx.tar`

#### 使用

修改`package.json`，最好设置`private=true`以防不小心运行`pnpm publish`，并添加`scripts.prepublishHook`。
```json
{
	"private": true,
	"scripts": {
		"prepublishHook": "echo 'Running prepublish hook...'"
	}
}
```

运行

支持一部分`pack`和`publish`的参数。workspace相关参数不支持。（例如-r）

```bash
publish-package publish/pack
```
