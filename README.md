[![Actions Status](https://github.com/GongT/baobao/workflows/ci/badge.svg)](https://github.com/GongT/baobao/actions)

# GongT's Node.js Monorepo

一些微小的 js 库/工具

# Repos | 子项目们

### Libraries | 库

-   [@idlebox/ensure-symlink]  
     A simple function ensure a file is a symbolinc link, and link to given target
    一个确保文件是符号链接，并且指向特定目标的工具函数
-   [@idlebox/node-json-edit]  
     Programmatically read and write `JSON with comments` (`jsonc`), and format it with prettier
    在程序中读取、修改带注释的 JSON 文件（即`jsonc`），支持通过 prettier 格式化
-   [@idlebox/itypes]  
     Some common types such as `setTimeout` and `console`, for package with neither `@type/node` nor `dom`
    给平台无关（既不是 node，也不是 dom）的包用的一些通用类型，比如`setTimeout` and `console`
-   [@idlebox/common]
    Bunch of very common helper functions (classes)
    一些通用工具函数（类）
-   [@idlebox/browser]
    Bunch of helper functions (classes) for browser
    一些浏览器中用到的工具函数（类）
-   [@idlebox/node]
    Bunch of helper functions (classes) for nodejs
    一些 NodeJs 中用到的工具函数（类）
-   [@build-script/typescript-transformer-dual-package]
    A TypeScript plugin to create "dual package" (esm+commonjs in same package)
    一个用于创建“双包”（即一个包同时支持 esm 和 commonjs 两种导入方式）的 TypeScript 插件
-   [@build-script/dual-package-runtime]
    A helper to support CLI part in a "dual package"
    一个在“双包”中同时还支持 CLI 的小工具

### CLI Tools | 命令行工具

_Some tool can use as library too | 有些命令行工具也可以当库用_

-   [@build-script/rush-tools]
    A tool enhancing `@microsoft/rush`
    一个增强`@microsoft/rush`功能的工具
-   [@build-script/poormans-package-change]
    A tool for (large number of) packages publishing workflow, check if local files is different with npm registry or not
    一个用于发布（大量）包的工具，可以检查本地文件是否与 NPM 上的不同（进而需要发布新版本）
-   _[@build-script/single-dog]_
    A _single_ coder can create project in one key
    单身狗可以在半夜一键向 GitHub 拉一坨新屎的工具（一键创建工程）
-   [unipm]
    A commandline wrapper for `npm`, `yarn`, `pnpm` and `rush`
    一个用统一参数调用`npm`、`yarn`、`pnpm`、`rush`的工具
-   [7zip-bin-wrapper]
    Cross platform `7za` binary and nodejs wrapper
    跨平台的`7za`可执行文件，和它的 nodejs 包装

### Links | 链接

#### My other typescript/javascript repos | 我的其他 TS/JS 包

`...`

#### Relativd projects | 相关项目

[rush](https://rushstack.io)
