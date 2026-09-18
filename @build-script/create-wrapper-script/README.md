## create-wrapper-script - 脚本文件调用器生成器

该工具用于生成脚本文件的调用器，类似于 `npm install` 时在`node_modules/.bin` 目录下生成可执行文件的功能。

# 使用方法

```bash
# 在/usr/local/bin/call-name创建一个bash脚本，运行它会调用/path/to/file.js
# 如果没有“call-name”部分，会设为源文件去掉扩展名（使用 `-T` 则报错）
npx @build-script/create-wrapper-script -T /path/to/file.js /usr/local/bin/call-name
```

可选参数:

* `--workspace=<path>`: 指定工作空间路径，默认使用绝对路径。
* `-T`: 目标一定是文件，不能是目录。

# 脚本使用

```bash
import { createWrapperScript } from '@build-script/create-wrapper-script';

createWrapperScript({
	
});
```
