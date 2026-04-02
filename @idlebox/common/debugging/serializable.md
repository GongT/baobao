<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### isScalar

判断值是否为标量类型 (包括 `bigint`、`number`、`boolean`、`string`、`symbol`、`undefined`、`null`、`Date`、`RegExp`、`Function` 及其装箱对象)。

**类型:** `(value: any) => value is ScalarTypes`

---

##### SerializableKind

序列化状态枚举:

| 值 | 含义 |
|---|---|
| `Invalid` (0) | 不可序列化 |
| `Primitive` (1) | 基本类型，可直接序列化 |
| `Manual` (2) | 有 `toJSON` 或 `Symbol.toPrimitive`，手动序列化 |
| `Other` (3) | 普通对象，需递归处理 |

---

##### isSerializable

检查值的序列化状态。`Map`、`Set`、`RegExp`、`Promise`、浏览器 `EventTarget` 等返回 `Invalid`；`NaN`/`Infinity` 返回 `Invalid`。

**类型:** `(value: any) => SerializableKind`

---

##### getTypeOf

返回值的类型字符串，比 `typeof` 更精细 (区分 `null`、`Promise`、`Error`、DOM 元素等)。

**类型:** `(value: any) => string`

---

##### assertSerializable

断言对象可序列化，若发现不可序列化的值则打印路径并抛出 `TypeError`。

**类型:** `(value: any) => void`
