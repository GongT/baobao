# Node.js 包发布辅助工具集

# 使用方式

```text id="usage"
Usage:
    njspkg [通用参数] <命令> [命令参数]

通用参数:
  --quiet: 减少输出
  --registry <value>: npm服务器，默认从.npmrc读取(必须有schema://)
  --dist-tag <value>: 需要从服务器读取时使用的tag，默认为"latest"
  --package <value>: 实际操作前，更改当前目录（此文件夹应包含package.json）
  --json: 输出json格式（部分命令支持）
  --help: 显示帮助信息

detect-package-change --bump --json 本地运行npm pack并与npm上的最新版本对比差异
  --bump: 当发现更改时更新package.json，增加版本号0.0.1

monorepo-bump-version 在monorepo中按照依赖顺序分别运行detect-package-change
  --skip <value>: 跳过前N-1个包（从第N个包开始运行）
  --allow-private: 即使private=true也执行
  --exclude <value>: 排除指定的包

monorepo-cnpm-sync 调用cnpm sync命令
  需要在PATH中存在cnpm命令

monorepo-invalid 从npm缓存中删除关于本monorepo的数据，以便安装最新版本
  

monorepo-list --verbose --json --relative 列出所有项目目录
  --verbose: 列出所有信息，而不仅是目录
  --json: 输出json（同时使--verbose和--relative无效）
  --relative: 输出相对路径（相对于monorepo根目录）

monorepo-publish --verbose / --silent --dry 在monorepo中按照依赖顺序发布修改过的包
  --verbose: 列出所有信息，而不仅是目录
  --dry: 仅检查修改，不发布（仍会修改version字段）
  --debug: 运行后不要删除临时文件和目录
  --skip <value>: 跳过前N-1个包（从第N个包开始运行）
  --private <value>: 即使private=true也执行

monorepo-tsconfig --dev 为所有项目的 tsconfig.json 添加 references 字段
  查找tsconfig.json和src/tsconfig.json
      如果不在这里，可以在package.json中设置exports['./tsconfig.json'] = './xxxx'
  --dev: 也将devDependencies中的包添加到references中

monorepo-upgrade 更新monorepo中各个项目的所有依赖版本
  被更新的包必须没有或者用^作为前缀

run-if-version-mismatch --no-cache --flush -- command to run 如果版本号改变，则运行命令
  如果package.json中的version与npm上的版本(latest)不一致，则运行命令
    注意: 命令行中的"--"是必须的
  
  --no-cache: 禁用缓存
  --flush: 程序成功退出时自动删除npm缓存
  --newer: 只有在本地版本号大于远程版本号时才运行（默认只要不同就运行）
```


## 可用工具

<details open>
<summary><h2>detect-package-change - 检测包是否改变</h2></summary>

-   `--bump`: 不要输出，而是：如果发现有修改，则自动更新package.json（当前仅支持将version的PATCH位+1）
-   `--json`: 输出json（当检测到stdout不是终端时，默认为json输出）

此工具要求PATH中存在`git`

输出结果示例:

-   `--json`模式: `{ changedFiles: [......], changed: true }`
-   默认模式: `changed no.` / `changed yes.`

只要运行过程没有错误，程序就返回0，无论是否发现修改。

<details>
  <summary>实现细节</summary>
  
1. 调用`npm-registry-fetch`包，从npm下载最新的`package.json`，它支持标准http缓存和代理设置
1. 和本地的`package.json`比较`version`字段
    - 如果本地版本号大于远程，则直接判定为`有修改`
1. 从npm下载dist.tarball指定的压缩包，解压到一个临时目录中
1. 在包目录中运行`npm pack`（也支持pnpm）得到压缩包
1. 检查两个压缩包是否相同
	1. 在临时目录中初始化git仓库
	1. 立即提交前面解压结果
	1. 将打包结果覆盖到同一个目录中
	1. 再次提交
	1. 检查`git log`输出的内容（强制LANG=C）
		- 如果没有任何修改，则判定为`无修改`
1. 如果有`--bump`，调用`semver`修改`package.json`中的`version`字段
2. 否则输出`有修改`
</details>
</details>

<details open>
<summary><h2>run-if-version-mismatch - 判断本地version和远程是否相同，如果不同，运行一个程序</h2></summary>

**命令行中的“--”不可省略**

示例：

```
Eg: njspkg run-if-version-mismatch --flush -- pnpm publish --no-git-checks
```

</details>


<details open>
<summary><h2>run-if-version-mismatch - 在每个项目中运行npm run watch脚本</h2></summary>

按照依赖顺序，只有上游项目至少成功一次，才会启动下游的watch脚本

通过匹配命令输出确定编译是否成功

目前仅支持 tsc、heft 两个命令，需要在[这里](src/common/watch-runner/judge.ts)添加新的判断函数

</details>


<details open>
<summary><h2>monorepo-publish - 判断包内容，如果有修改就发布到npm</h2></summary>


相当于按照依赖顺序，在每个项目中：
1. `njspkg detect-package-change --bump`
1. `njspkg run-if-version-mismatch -- pnpm run publish`

然后在工程中运行一次：
2. `njspkg monorepo-cnpm-sync`
3. `njspkg monorepo-invalid`

</details>
