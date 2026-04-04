# Usage
<!-- last update: 2026-04-04 -->

浏览器端工具函数库，提供文件下载、开发调试设置、LocalStorage 封装（含单例/超时版本）、带重试的 fetch、Web Audio 录音/播放工具、用户代理检测，以及内部工具类型。

<!-- File: binray/download-blob.md -->

## downloadBlob

触发浏览器文件下载，将 `Blob` 对象以指定文件名保存到本地。

```typescript
function downloadBlob(blob: Blob, name: string): void;
```

**参数说明**
- `blob` — 要下载的 Blob 数据
- `name` — 下载文件名

<!-- File: development/development-settings.md -->

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

<!-- File: global.d.md -->

此为空的全局类型声明文件，不包含任何公开 API。

<!-- File: internal/typings.md -->

## isValidObjectId

检查字符串是否为合法的 MongoDB ObjectId（24位十六进制字符串）。

```typescript
const isValidObjectId: (id: string) => boolean;
```

<!-- File: request/fetch/retry-fetch.md -->

## retryFetch

带超时和自动重试的 `fetch` 封装，在请求超时时自动重试，遇到其他错误直接抛出。

```typescript
async function retryFetch(
  url: string,
  options: IRetryOptions
): Promise<Response>;
```

**参数说明**
- `retries` — 最大重试次数，默认 `3`
- `delay` — 每次重试之间的等待时间（毫秒），默认 `800`
- `timeout` — 单次请求超时时间（毫秒），默认 `3500`
- `signal` — 外部 `AbortSignal`，中止时传播给内部请求
- 其余参数与标准 `fetch` 的 `RequestInit` 相同

**特殊说明**
只有 `TimeoutError` 才会触发重试，其他类型的错误立即抛出。超出重试次数后抛出错误。

<!-- File: storage/local-storage.md -->

## LocalStorage 工具

基于 `localStorage` 的单例存储封装，支持跨 Tab 同步（监听 `storage` 事件）和变更通知。

#### StorageKey

预定义的 `localStorage` 键名枚举。

```typescript
enum StorageKey {
  I18N = 'i18n',
  Development = '.development',
  UserSettings = 'user-settings',
}
```

#### ILocalStorage

`LocalStorage<T>` 的公开类型别名。

#### LocalStorageString

存储字符串类型的 LocalStorage 单例，按 `StorageKey` 键获取同一实例。

```typescript
class LocalStorageString extends LocalStorage<string> {
  constructor(key: StorageKey, defaultValue: string);
  readonly data: string;
  readonly onChange: EventRegister<string>;
  reload(): void;
  set(value: string): void;
}
```

#### LocalStorageObject

存储 JSON 对象类型的 LocalStorage 单例。

```typescript
class LocalStorageObject<T extends object> extends LocalStorage<T> {
  constructor(key: StorageKey, defaultValue: T);
  readonly data: DeepReadonly<T>;
  readonly onChange: EventRegister<DeepReadonly<T>>;
  reload(): void;
  set(value: T): void;
  merge(input: Partial<T>): void;
  active(): T;  // 仅用于调试，返回深层 Proxy 代理
}
```

**特殊说明**
同一 `StorageKey` 的多次实例化会返回相同的单例对象。`active()` 方法返回一个深层 Proxy，对其属性赋值会自动触发 `set()` 持久化，仅限调试使用。

<!-- File: storage/with-timeout.md -->

## TimeoutStorage

带过期时间的 localStorage 存储封装。存储的数据在到达过期时间后自动视为不存在。

```typescript
class TimeoutStorage<T> {
  constructor(key: string, storage?: Storage);
}
```

默认使用 `localStorage`，可传入其他 `Storage` 实例（如 `sessionStorage`）。

| 成员 | 说明 |
|------|------|
| `save(data, expire)` | 保存数据，`expire` 可为 `Date` 对象或 UTC 日期字符串 |
| `read()` | 读取未过期的数据，过期或不存在时返回 `undefined` |
| `read(defaultVal)` | 读取未过期的数据，过期或不存在时返回默认值 |
| `getExpire()` | 获取过期时间（`Date`），已过期时返回 `null` 并清除数据 |
| `forget()` | 删除存储的值（保留过期时间键）|

**示例**
```typescript
const cache = new TimeoutStorage<string>('my-key');
cache.save('hello', new Date(Date.now() + 60000)); // 缓存1分钟
cache.read('default'); // 返回 'hello'
```

<!-- File: tsconfig.md -->

此为 TypeScript 配置文件，不包含可文档化的公开 API。配置了 Web 环境（lib: dom）并排除 `*.generator.ts` 文件。

<!-- File: user-agent/browserlist.generator.md -->

此为代码生成器，不导出面向用户的公开 API。使用 `browserslist-useragent-regexp` 生成 `browserlistSupport` 正则表达式常量，用于在运行时检测浏览器是否满足项目所需的最低版本要求（支持 WebAssembly 和 Web Cryptography API）。

<!-- File: web-audio/audio-player.md -->

## Web Audio 播放工具

提供基于 MediaSource Extension API 的流式音频播放基础设施。

#### StreamAppender

将 `ArrayBuffer` 数据片段顺序追加到 `SourceBuffer` 的队列管理器。

```typescript
class StreamAppender {
  constructor(stream: SourceBuffer);
}
```

| 成员 | 说明 |
|------|------|
| `append(buffer)` | 追加音频数据，finish 后不可再调用 |
| `finish()` | 标记数据输入结束，等待队列播放完毕后完成 |
| `terminate()` | 立即清空队列并结束，用于强制中断 |
| `wait()` | 等待所有数据播放完毕 |

#### MediaForPlayback

封装 `MediaSource`，提供完整的音频媒体生命周期管理。

```typescript
class MediaForPlayback {
  constructor();
  readonly id: number;
  readonly ready: Promise<void>;
}
```

| 成员 | 说明 |
|------|------|
| `open(mime)` | 打开媒体源，指定 MIME 类型，返回 `StreamAppender` |
| `playToNewAudioElement()` | 创建并返回 `HtmlAudioPlayer`，绑定到此媒体源 |
| `finish()` | 等待媒体流结束 |
| `dispose()` | 释放资源 |

#### HtmlAudioPlayer

HTML `<audio>` 元素的封装，提供说话状态事件。

```typescript
class HtmlAudioPlayer {
  constructor();
  readonly element: HTMLAudioElement;
  readonly onHumanSpeaking: EventRegister<boolean>;
}
```

| 成员 | 说明 |
|------|------|
| `onHumanSpeaking` | 播放/暂停时触发，带 700ms 延迟防抖 |
| `onEnd(fn)` | 播放结束时回调（已结束则立即调用）|
| `dispose()` | 停止播放并释放资源 |

#### disposeAudioElement

向 `HTMLAudioElement` 派发 `ended` 事件，用于通知监听者音频已停止。

```typescript
function disposeAudioElement(audio: HTMLAudioElement): void;
```

<!-- File: web-audio/pcm-recorder.md -->

## PCM 音频录制工具

基于 Web Audio API 的 PCM 格式麦克风录音工具，输出原始 16-bit 有符号整数 PCM 数据流。

#### RawPcmStreamNode

连接到 `AudioNode` 的录音节点，将浮点音频数据转换为 16-bit PCM 并通过事件输出。继承自 `EnhancedDisposable`。

```typescript
class RawPcmStreamNode extends EnhancedDisposable {
  constructor(audioContext: AudioContext, bitDepth?: number, latency?: number);
}
```

| 成员 | 说明 |
|------|------|
| `onDataAvailable` | 每当有 PCM 数据可用时触发，携带 `Uint8Array` |
| `onFinished` | 录音自然结束时触发（连续静默超过 `latency * 2` ms）|
| `bufferSize` | 当前使用的缓冲区大小（只读）|
| `connectFrom(source)` | 将此录音节点连接到音频源节点 |
| `shutdown()` | 优雅结束录制，等待静默后触发 `onFinished` |

#### RawPcmStreamRecorder

高层录音控制器，负责请求麦克风权限、管理 AudioContext 生命周期。继承自 `EnhancedDisposable`。

```typescript
class RawPcmStreamRecorder extends EnhancedDisposable {
  constructor(bitDepth?: number, sampleRate?: number);
  readonly bitDepth: number;
  readonly sampleRate: number;
}
```

| 成员 | 说明 |
|------|------|
| `context` | 延迟初始化的 `AudioContext`（首次访问时创建）|
| `startRecording(latency?)` | 开始录音，返回 `IRecorder`，可重复调用（返回同一）|
| `stopRecording()` | 停止录音，等待最后的音频处理完成 |
| `getPromise()` | 等待整个录音过程结束的 Promise |

**示例**
```typescript
const recorder = new RawPcmStreamRecorder();
const stream = await recorder.startRecording();
stream.onDataAvailable((data) => sendToServer(data));
// ... 用户说话 ...
await recorder.stopRecording();
```

