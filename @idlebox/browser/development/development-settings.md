<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## develSettings

开发调试设置对象，挂载到 `window.devel`，使用 `localStorage` 持久化。包含 logger 配置和网络延迟模拟。

```typescript
const develSettings: LocalStorageObject<IDevStore>;
```

其中 `IDevStore` 包含:
- `logger.defaultLevel` — 默认日志级别
- `logger.enabled` — 各模块的日志级别覆盖
- `delayNetworkSeconds` — 网络延迟模拟（秒）

导入此模块会立即将 `develSettings.active()` 代理绑定到 `window.devel`，并自动应用 logger 配置。
