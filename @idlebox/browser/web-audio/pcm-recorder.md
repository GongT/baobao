<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

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
