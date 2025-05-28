## autoindex - 创建导出索引

从整个项目所有ts文件中收集导出，生成一个`autoindex.generated.ts`文件，放在`tsconfig.json`旁边。

-   “整个项目”是指通过TypeScript api，获取到“运行tsc -p时会读取的文件”列表


### 使用方法
```bash
autoindex [--watch] [--debug] [...] project
```

可用选项：
-   `-w, --watch`: 监听文件变化，自动更新索引
-   `-d, --debug`: 输出调试信息

-   `-o, --output <filename>`: 输出文件路径，默认为`./autoindex.generated`，相对于`tsconfig.json`所在目录。

-   `--exclude <pattern>`: 排除某些文件或目录，可多个。*相当于额外添加到tsconfig.json的`exclude`字段中*
-   `--include <pattern>`: 包含某些文件或目录，可多个。*相当于额外添加到tsconfig.json的`include`字段中*

-   `-b, --blacklist <pattern>`: 忽略匹配的符号名称，可多个，仅支持 * 作为通配符。

-   `-a, --absolute <#??>`: 默认生成类似 `import './xxx'` 的相对路径，使用此选项会变成类似 `import '#??/xxx'` 的绝对路径。
-   `--skip-tag <tag>`: 忽略被 `@tag` 注释的符号，可多个，不传时默认 `internal`，传入任意值则不带此默认。

-   `project`:  项目使用的tsconfig.json路径（或其目录）。
