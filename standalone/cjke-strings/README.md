# CJKE 字符串模块

用于处理东亚文字（**C**hinese **J**apanese **K**orean）和 **E**moji 字符串的工具。

代码来源如下:

-   我自行编写的代码
-   从 sindresorhus/string-width 复制的代码库
-   从 tonytonyjan/string-width 学习的 Emoji 处理方式
-   从多个 Wiki 页面复制的 Unicode 表

通常还需要名为 `stringz` 的模块。

## API

大部分函数不可以输入带有换行符的字符串。

### readFirstCompleteChar(str: string): CodePointInfo

获取给定字符串开头的第一个完整字符或转义序列

| 变量 | 描述       |
| ---- | ---------- |
| str  | 任意字符串 |

返回值: **CodePointInfo**

| 变量    | 类型    | 描述                     |
| ------- | ------- | ------------------------ |
| data    | string  | 第一个完整字符或转义序列 |
| width   | number  | 该字符的显示宽度         |
| length  | number  | 该字符的字符串长度       |
| visible | boolean | 该字符是否可见           |

### function limitWidth(str: string, limit: number): LimitResult

截取指定显示宽度的字符串，实际返回的字符串可能比目标宽度短。

| 变量  | 描述                 |
| ----- | -------------------- |
| str   | 任意字符串           |
| limit | 要截取的目标显示宽度 |

返回值: **LimitResult**

| 变量      | 类型   | 描述               |
| --------- | ------ | ------------------ |
| result    | string | 截取结果           |
| width     | number | 结果的实际显示宽度 |
| remaining | string | 剩余的字符串       |

### function fixedWidth(str: string, width: number): string

与 `limitWidth` 类似，但返回固定宽度的字符串，必要时会在字符串末尾填充空格。

| 变量  | 描述         |
| ----- | ------------ |
| str   | 任意字符串   |
| width | 目标显示宽度 |

返回值: **LimitResult** 和 `limitWidth` 相同，且其中的 `width` 始终等于输入的 `width`


### function stringWidth(str: string): number

计算字符串的显示宽度

| 变量 | 描述       |
| ---- | ---------- |
| str  | 任意字符串 |

返回: **number**，表示字符串的显示宽度

### function isCombiningCharacters(code: number): boolean

| 变量 | 描述                             |
| ---- | -------------------------------- |
| code | `'string'.charCodeAt()` 的返回值 |

返回: **boolean**，表示字符是否位于组合字符列表中

### function unicodeEscape(str: string): string

| 变量 | 描述       |
| ---- | ---------- |
| str  | 任意字符串 |

返回: **string**，表示转义后的字符串

### function chunkText(str: string, width: number): string[]

按指定显示宽度分割字符串，部分块可能比目标宽度短。

### function boxText(str: string, width: number): string[]

同 `chunkText`，但可以输入多行文本。

### function maxWidthMultiline(str: string): number

计算多行文本的最大显示宽度。

### function fixedWidthMultiline(str: string, width: number = Infinity): IFixedMultiline

同 `fixedWidth`，但针对多行文本，所有行均会被填充至最长行的宽度。

返回值: **IFixedMultiline**

| 变量     | 类型     | 描述                   |
| -------- | -------- | ---------------------- |
| maxWidth | number   | 多行文本的最大显示宽度 |
| result   | string[] | 每一行的固定宽度文本   |

## SupportInfo

**绝大多数现代系统中无需设置**

| 属性          | 描述                          |
| ------------- | ----------------------------- |
| emojiSequence | 是否支持 Emoji 序列 `👩🏻‍❤️‍💋‍👨🏻`      |
| combining     | 是否支持组合字符 `À̀̀`          |
| surrogates    | 是否支持代理对 `\uD83D\uDE00` |
| tabSize       | number                        | 制表符的显示宽度，默认 8 |
