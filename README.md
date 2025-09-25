# BAOBAO
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fbaobao.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fbaobao?ref=badge_shield)


TypeScript代码和工具库

## @build-script - 构建生成相关工具

* [autoindex](./@build-script/autoindex) 自动创建导出索引文件，将所有文件汇聚到一个文件中
* [codegen](@build-script/codegen) 用ts编写简单的代码生成器
* [package-tools](@build-script/package-tools) npm包管理与发布辅助工具集合
* [rushstack-config-loader](@build-script/rushstack-config-loader) 用于加载[riggable config](https://www.npmjs.com/package/@rushstack/rig-package)的库

## @idlebox - 函数库

基础函数库

* [common](@idlebox/common) 通用函数库
* [node](@idlebox/node) nodejs函数库
* [browser](@idlebox/browser) 浏览器函数库
* [dependency-graph](@idlebox/dependency-graph) [dependency-graph](https://www.npmjs.com/package/dependency-graph)的包装

----
CLI程序辅助库

* [args](@idlebox/args) 命令行参数解析
* [logger](@idlebox/logger) 简单日志
* [chokidar](@idlebox/chokidar) 文件监控

----
文件系统和代码工具

* [ensure-symlink](@idlebox/ensure-symlink) 确保符号链接存在且内容正确
* [esbuild-executer](@idlebox/esbuild-executer) TypeScript文件执行器，优化monorepo
* [ignore-edit](@idlebox/ignore-edit) 编辑`.gitignore`、`.npmignore`等忽略文件
* [json-edit](@idlebox/json-edit) 编辑`jsonc`文件
* [json-extends-loader](@idlebox/json-extends-loader) 加载带有`extends`的`jsonc`文件（比如tsconfig）
* [node-error-codes](@idlebox/node-error-codes) 从nodejs api文档中自动提取的错误代码
* [typescript-surface-analyzer](@idlebox/typescript-surface-analyzer) TypeScript界面分析工具

----
网络和数据处理
* [section-buffer](@idlebox/section-buffer) 多线程下载缓冲区


----
基于mobx的状态管理

* TODO

## @mpis - My Project Is Simple

构建事件协议

* [shared](@mpis/shared) 标准协议
* [client](@mpis/client) 协议客户端库、标准输出转换程序
* [run](@mpis/run) 单项目build、watch工具
* [monorepo](@mpis/monorepo) monorepo build、watch工具
* [server](@mpis/server) 协议服务器库（run和monorepo基于此）

----
协议实现

* [esbuild](@mpis/esbuild) esbuild
* [typescript](@mpis/typescript) tsc

----
其他工具

* [publisher](@mpis/publisher) npm包发布工具

## 独立包

* [cjke](standalone/cjke) 计算汉字和emoji的宽度
* [unipm](standalone/unipm) 自动选择包管理器安装依赖（pnpm、yarn、npm）


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2FGongT%2Fbaobao.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2FGongT%2Fbaobao?ref=badge_large)