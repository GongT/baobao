# Amaro 包

[Amaro](https://github.com/nodejs/amaro)是nodejs中用于处理ts文件的工具。

新版本node不再支持transform功能（虽然amaro本身是支持的），所以需要直接import它实现转换。

但是amaro自身并没有导出load函数，所以只好复制代码过来用。

当前的amaro版本是: v1.2.1 | 需要关注更新，重新复制代码。
