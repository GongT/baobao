<!-- commit:d0614317d3f15abe08550bb0fd5c2d4b9d0a100b -->

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
