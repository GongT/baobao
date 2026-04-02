<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### addDisposableEventListener

为事件发射器添加事件监听器，返回可取消的 `IDisposable`。

**类型:** `(target: IEventEmitterObject | IShorthandEmitterObject, type: string, handler: Function) => IDisposable`

支持两种接口的 target:
- `IEventEmitterObject`: 有 `addListener` / `removeListener`
- `IShorthandEmitterObject`: 有 `on` / `off`
