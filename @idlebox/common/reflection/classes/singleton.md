<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### singleton

类装饰器，使类变为单例。需要 TC39 Stage 3 装饰器支持。

**类型:** `(type?: SingletonType) => ClassDecorator`

**参数:**
- `type` — 重复创建时的行为，默认 `SingletonType.ReturnSame`

**SingletonType 枚举:**
| 值 | 说明 |
|---|---|
| `Throw` (0) | 重复创建时抛出错误 |
| `ReturnSame` (1) | 重复创建时返回已有实例 |

---

##### createSingleton

手动创建并缓存类的单例实例 (保存在类自身上)。

**类型:** `<T>(Class: new () => T) => T`
