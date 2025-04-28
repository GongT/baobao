# reload-watcher

在多次`import()`同一个模块文件时，`import()`会缓存模块文件的内容。这个包可以帮助你在开发时监视模块文件的变化，并在变化时自动“清除”缓存。

基于：
* [chokidar](https://npm.js/package/chokidar)
* [Nodejs的早期预览API](https://nodejs.org/api/module.html#customization-hooks)

## 警告

这个包不应该在生产环境中使用。它是一个开发工具，用于帮助在开发过程中重新加载模块。     
本质上没有从内存删除任何东西，所以如果被加载的模块设计不好，则会发生内存泄漏。     
也不主动处理任何side-effects，例如注册的监听器等。

## 使用

```ts
import express from "express";
import {
	install,
	onFileChange,
	inspectCache,
	forceInvalidate,
	type IChangeEvent
} from "@idlebox/reload-watcher";
/**
 * 注意: 假如express-app.js直接或间接使用了config.js中的内容，
 * 由于此import语句在install()之前执行，所以不会监听到，修改其内容无法触发缓存刷新功能
 */
import { config } from "./some/config.js";

const app = express();

install(); // 必须调用一次（反复调用无效，显示一个warning）

app.use((req,res) => {
	const middleware = await import("./express-app.js");
	middleware.default(req, res);
});

app.listen();

onFileChange((info) => {
	console.log("File changed:", info);
});

for(const moduleInfo of await inspectCache()){
	console.log("Module info:", moduleInfo);
}

await forceInvalidate(import.meta.resolve("./some/config.js"));
```


## 说明

通常情况下，Nodejs会缓存所有文件。    
当你反复使用`import('x')`语句时，你只能得到同样一个x。

你可以通过`import('x?version='+Date.now())`来强制加载磁盘上的版本，但是x的子模块仍然不会重新加载。


## 原理

这个包实现了一个loader，它注册(install)后会记录import调用（其中包含**首次**import它。

把所有

> bug: 其中的require()行为不能完全确定，参见[这里: Caveat in the asynchronous load hook](https://nodejs.org/api/module.html#caveat-in-the-asynchronous-load-hook)）

它不会以任何形式修改import的结果，当使用`const x = await import('x')`时，x的值就已经完全确定，无论如何修改硬盘上的文件，x都不会改变。

所有更新只有在下一次调用`x = import('x')`时，新的返回值才能反应当前硬盘上的修改。
