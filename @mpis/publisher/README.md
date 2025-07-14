# pnpm 自定义发布器

**将tar包发布到npm前执行脚本（可以用来处理package.json）**

#### publish 流程
1. 调用 `pnpm run prepublishOnly`
1. 调用 `pnpm pack`
1. 将生成的 tar 包解压到临时目录
   1. 运行 `pnpm run prepublishHook`
   1. 删除`prepublishOnly`、`prepack`等[publish lifecycle](https://docs.npmjs.com/cli/v8/using-npm/scripts#npm-publish)脚本
   1. 调用 `pnpm publish`

#### pack 流程
1. 调用 `pnpm pack`
1. 将生成的 tar 包解压到临时目录
   1. 运行 `pnpm run prepublishHook`
   1. 删除`prepack`等[pack lifecycle](https://docs.npmjs.com/cli/v8/using-npm/scripts#npm-pack)脚本
   1. 调用 `pnpm pack`

#### extract
1. 先运行pack流程
2. 将生成的 tar 包解压到临时目录

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

支持一小部分`pack`和`publish`的参数。

```bash
publisher pack [--out xxx.tgz]
publisher publish [--access public] [--dry-run] [--force] [--no-git-checks] [--publish-branch master] [--report-summary] [--tag latest] [--registry https://registry.npmjs.org]
```
