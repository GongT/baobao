# Dockerfile Split

`@idlebox/dockerfile-split` 是一个用于解析 Dockerfile 的工具库。它可以将 Dockerfile 分割成独立的指令和注释段落，方便进行分析和处理。

## 安装

```bash
npm install @idlebox/dockerfile-split
```

## 使用示例

```ts
import { DockerfileParser } from '@idlebox/dockerfile-split';

const result = new DockerfileParser().parse(`
    fRoM     node:14    aS    builder

# 这是一个注释

RUN --mount=type=cache,target=/root/.cache \
	cat <<EOF > /tmp/hello.txt
Hello, World!
EOF

	# 这也是一个注释

`);

console.log(result);
```

## 说明

1. 不读取文件，只进行字符串解析。
2. 支持解析多行指令和注释，但不验证其语法正确性，例如行尾忘记反斜杠不会报错，而是将后续行仍然视为当前指令的一部分。
3. 空行被认为是一种注释。
4. 不对指令本身进行任何解析，如果需要可以使用 [unbash](https://npmjs.com/package/unbash) 工具进行进一步处理（注意行尾斜杠）。
5. 基本保留原始的 Dockerfile 格式，包括空行和缩进，但有以下例外:
   1. 除了heredoc外所有行尾空白会被去掉。
   2. 所有指令关键字会被标准化为大写，例如 `from` 会被解析为 `FROM`，且前方空白会被删除，后方空白被替换为单个空格。
6. 每个段落（指令或注释）不保留其末尾换行符
   1. 例如连续3个空行，解析得到“\n\n”的注释。


### 自定义指令集

```ts
import { DockerfileParser, DockerInstructions } from '@idlebox/dockerfile-split';

const parser = new DockerfileParser(['MYINSTR', ...DockerInstructions]);

const result = parser.parse(`
MYINSTR some arguments
`);
```
