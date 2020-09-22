[English](./README.md)

# export-all-in-one

在你的 TypeScript 项目中“收集”**所有**`export`语句，把它们从**一个**入口文件中重新导出，于是其他人可以`import { 任何, 东西 } from '@你的/包'`。而不需要了解`任何`、`东西`在哪个文件里。_你可以在不同版本间瞎几把改文件路径，没有人会察觉。_

# 使用方法：

#### 一、安装

```bash
npm -g install build-script
```

#### 二、修改你的 tsconfig

由于种种限制，`outDir` 是必须的。不支持原地编译。

#### 三、使用魔法

_`tsconfig.json` 可以省略，这两个命令的先后顺序无所谓_

```sh
export-all-in-one ./path/to/tsconfig.json
tsc -p ./path/to/tsconfig.json
```

**💥BOOM**，所有东西都导出了。

# 提示：

1. 你还需要在`package.json`中设置入口文件  
   这个工具会在你的`outDir`文件夹里创建`_export_all_in_one_index.js`，你需要把`package.json`中的`main`指向它。
1. 同时还要改`package.json`中的 types 或 typings 字段，值为`./docs/package-public.d.ts`
1. 当探测到“双包模式”时，这个工具同时还会创建`_export_all_in_one_index.cjs`，你需要修改`package.json`中的`exports`。

链接：

-   [@build-script/typescript-transformer-dual-package](https://www.npmjs.com/package/@build-script/typescript-transformer-dual-package)
-   [@build-script/export-all-in-one-inject](https://www.npmjs.com/package/@build-script/export-all-in-one-inject)

# 选项与配置：

如果一个**导出的**符号有注释文档（`/** */`）：

-   带有`@extern`标签的会被导出
-   带有`@internal`标签的会被隐藏（.d.ts 和\_export_all_in_one_index 里都不会有它）
-   没用注释，或没有上面两种标签：使用*默认设置（exportEverything）*

没有`export`的符号无论加什么都不会被导出。

在`package.json`中的配置：

```jsonc
{
	"exportAllInOne": {
		"exportEverything": true
	}
}
```

| 配置             | 类型    | 默认值 | 描述                                     |
| ---------------- | ------- | ------ | ---------------------------------------- |
| exportEverything | boolean | true   | 符号如果不加注释，默认应该被导出还是隐藏 |

# 这个包会做：

1. 通过你的`tsconfig.json`和 typescript api 解析你项目涉及到的文件（所以不被 tsc 处理的文件也不会被这个包处理）
1. 收集各个文件中导出的符号信息
1. 在临时文件夹里生成一个`_export_all_in_one_index.ts`
1. 调用和 typescript 编译`_export_all_in_one_index.ts`然后把结果复制到`outDir`里
1. 调用`@microsoft/api-extractor`分析`_export_all_in_one_index.ts`然后把结果复制到`你的包/docs/`里

# 限制：

1. 显然，你的多个文件不可以导出同一个名称，但你本来也不该这么做，除非你想让用户的 IDE 懵逼

1. `默认导出`会被变成`命名导出`，名称就是文件名（不建议用默认导出）
