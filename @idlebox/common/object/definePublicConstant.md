<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### definePublicConstant

以 `configurable: false, enumerable: true, writable: false` 定义不可修改的公开属性。

**类型:** `(object: any, propertyKey: string | symbol, value: any) => void`

---

##### definePrivateConstant

以 `configurable: false, enumerable: false, writable: false` 定义不可修改的私有 (不可枚举) 属性。

**类型:** `(object: any, propertyKey: string | symbol, value: any) => void`
