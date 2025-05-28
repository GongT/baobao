# 一个小脚本，用来在开发时执行typescript代码

**需要 Node.js >= 18.19.0**

#### 使用
```js
let exports;
try {
	// 首先尝试加载编译好的代码
	exports = await import('../dist/index.js');
} catch (e) {
	if (e.code === 'ERR_MODULE_NOT_FOUND') {
		// 如果没有，则使用esbuild编译
		const { execute } = await import('@idlebox/esbuild-executer')
		const tsFile = import.meta.resolve("../src/index.ts");
		exports = await import(tsFile);
	}
	throw e;
}

export const x = exports.x;
```

### 当然也可以无条件使用esbuild

```js
import { execute } from '@idlebox/esbuild-executer'
const tsFile = import.meta.resolve("../src/index.ts");
const exports = await execute(tsFile)

export const x = exports.x;
```

#### 原理
1. 注册加载器 ([Customization Hooks](https://nodejs.org/api/module.html#customization-hooks))
2. 使用esbuild将ts文件编译成js
3. 使用`import()`加载ts文件路径
4. 在hook中实际返回编译后的js代码

#### 和其他加载器（如ts-node、swc）的区别
这个脚本在运行esbuild时使用了“bundle=true”，也就是把所有文件一次性打包成一个文件，但不打包node_modules里的任何内容。

其他加载器普遍是按需加载的，只有在import语句确实运行的时候才会加载对应的文件。


### 其他说明
设置环境变量 `WRITE_COMPILE_RESULT=true` 可以将编译结果写入到文件中，可以检查文件是否正常。（不会运行该文件）

已使用 [source-map-support](https://www.npmjs.com/package/source-map-support) 来支持源映射。    
设置环境变量 `DISABLE_SOURCE_MAP=true`，或者node参数中存在`--inspect`、`--inspect-brk`、`--enable-source-maps`时将会禁用源映射。

设置 `DEBUG=executer:*` 查看详细调试日志
