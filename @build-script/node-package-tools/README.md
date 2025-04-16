[English](./README.en.md)

# Node.js 包发布辅助工具集

# 使用方式

-   `node-package-tools [--common opts] <command> [--params]`
-   `njspkg [--common opts] <command> [--params]`

## 通用参数

_通用参数也可以在command后面_

-   `--quiet`: 默认显示较多输出，设置后只显示结果
-   `--registry <xxx>`: 默认使用.npmrc中的设置
-   `--dist-tag <xxx>`: 要比较的tag，默认为"latest"
-   `--package <xxx>`: 包的本地路径，默认为当前目录

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
1. 在包目录中运行`npm pack`（也支持pnpm、yarn）得到压缩包
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
<summary><h2>run-if-version-mismatch - 判断本地version和远程是否相同，如果不同运行一个程序</h2></summary>

没有专用参数，但**命令行中的“--”不可省略**

示例：

```
Eg: njspkg run-if-version-mismatch -- pnpm publish --no-git-checks
```

</details>
