<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### objectPath

通过 `.` 分隔的路径字符串获取对象的深层属性值。遇到 falsy 中间值时停止并返回该值。

**类型:** `(obj: object, path: string) => any`

---

##### ObjectPath

基于路径数组对对象进行读写操作的工具类。

**类型:** `class ObjectPath`

构造函数: `constructor(object: any)`

成员:

| 成员 | 说明 |
|---|---|
| `object` | 操作的目标对象 |
| `get(path)` | 按路径读值，中间路径不存在时返回 `undefined` |
| `exists(path)` | 判断路径末尾的 key 是否存在 |
| `set(path, value)` | 设置值，若 `value` 为 `undefined` 则删除并清理空对象 |
