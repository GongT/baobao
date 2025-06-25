# monorepo 构建工具

### 使用方法

```bash
# 在 monorepo 中任意 package 下安装
# 也可以添加 -g 装到全局（不推荐）
pnpm add @mpis/manager

# 调用构建或监视
pnpm exec build-manager <build|watch|clean>
```


### 包要求

有 `build` `watch` `clean` 三个脚本。（只有`build`是必须，`watch`默认=`build -w`，`clean`默认什么都不做），如果确实需要跳过，则设置`"build": ""`。

其中的命令必须支持 [构建协议](../shared)
