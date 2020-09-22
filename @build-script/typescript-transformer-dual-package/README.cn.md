[English](./README.en.md)

# 这是个啥子哦

这是一个[**t**typescript](https://github.com/cevek/ttypescript/)插件：

-   在 tsc 正常编译文件后，**重新**编译它，用于生成 commonjs 格式的文件（以`.cjs`结尾）。
-   在每个顶级`import`语句的路径中添加`.js`（暂不支持修改动态 import 语句）
-   在 commonjs 格式的文件中，将`import.meta.url`转换成`"file://" + __filename`

# 使用方法

1. 安装`typescript`和`ttypescript`，以及这个包
    ```bash
    npm install --save-dev typescript ttypescript @build-script/typescript-transformer-dual-package
    ```
1. 在你的`tsconfig.json`中插入一段：
    ```jsonc
    {
    	"compilerOptions": {
    		"module": "esnext", // 必须，可以是老版本（比如es6），但不能是commonjs、systemjs等非ESM目标
    		// ... 其他选项
    		"plugins": [
    			{
    				"transform": " @build-script/typescript-transformer-dual-package",
    				"compilerOptions": {
    					// [可选]
    					// 通常都不需要设置这个，可用于在第二次编译时覆盖父级compilerOptions
    					// 部分选项设置了也无效（例如module）
    				},
    				"verbose": false // 可以设置成true或1 ！输出爆炸警告！
    			}
    		]
    	}
    }
    ```
1. 写 TS 的大部分过程都不变，但是需要注意：
    - **别在你自己的代码里用任何一个`require`！**，用`await import()`代替。（使用`module::createRequire`API 的情况除外）
    - 不要在 import 的路径后面加`\.(c|m)?js`这样的扩展名（比如`import "./some-file.js"`）
1. 建议：
    - 打开`allowSyntheticDefaultImports`和`esModuleInterop`两个选项（在 tsconfig.json 里）
1. 编译时用`ttsc`而不是`tsc`（webpack 等打包工具均支持 ttypescript，具体看他们的文档）
    ```bash
    npm install ttypescript
    ttsc -p path/to/tsconfig.json
    ```
1. 在你的`package.json`里这样写：
    ```jsonc
    {
    	"type": "module",
    	"main": "lib/api.cjs",
    	// "browser": "lib/api.cjs",
    	"module": "lib/api.js",
    	// "esnext": "lib/api.js",
    	"bin": {
    		"some-cli-command": "lib/bin.cjs"
    	},
    	"exports": {
    		".": {
    			"require": "lib/api.cjs",
    			"import": "lib/api.js"
    		},
    		"some-path.js": {
    			"require": "lib/some-path.cjs",
    			"import": "lib/some-path.js"
    		}
    	}
    }
    ```
1. 如果你的包含有命令行入口（没有就没事了）**并且它不是 tsc 编译的输出**
    - 将其扩展名改成`.cjs`

# 相关信息：

-   TypeScript 的转换器:
    -   如果某一天 typescript 原生支持 tsconfig 里的 plugins，到时候`ttypescript`就不需要了
    -   [Typescript 编译器文档](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
    -   [ttypescript](https://github.com/cevek/ttypescript)
-   关于扩展名：
    -   Typescript 未来可能直接支持输出不同扩展名的文件，到时候这个包就没用了（可以用两次编译代替）
        -   [TypeScript#27957](https://github.com/microsoft/TypeScript/issues/27957)
        -   [TypeScript#18442](https://github.com/microsoft/TypeScript/issues/18442)
    -   最初的思路来自：[Zoltu/typescript-transformer-append-js-extension](Zoltu/typescript-transformer-append-js-extension)
-   Node.JS:
    -   关于 package.json 中`exports`字段的文档：[Conditional Exports](https://nodejs.org/api/esm.html#esm_conditional_exports)

# 基本原理

1. `tsc`/`ttsc`启动
    1. 它根据 tsconfig 加载这个包
    2. 创建`Program`对象，初始化包括这个包在内的 transformer
    3. 这个包内复制一个 Program 对象，用于之后编译 cjs。这次的 module 设置为 commonjs，并且添加了一个“内部 transformer”
2. 当`Program`的`emit`被调用（被 webpack、tsc），对每个被编译的文件：
    1. 修改文件中的`ImportDeclaration`和`ExportDeclaration`，给他们添加`.js`扩展名
    2. 调用之前复制的`Program`的`emit`，它会重新编译一次，在此过程中“内部 transformer”生效
        1. 修改文件中的`ImportDeclaration`和`ExportDeclaration`，给他们添加`.cjs`扩展名，并将`import.meta.url`替换
