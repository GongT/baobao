<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

## downloadBlob

触发浏览器文件下载，将 `Blob` 对象以指定文件名保存到本地。

```typescript
function downloadBlob(blob: Blob, name: string): void;
```

**参数说明**
- `blob` — 要下载的 Blob 数据
- `name` — 下载文件名
