<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

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
