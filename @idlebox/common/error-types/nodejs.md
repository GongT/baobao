<!-- commit: 9d5f3183dbb672ece9dfbf325a5be682b4e709a1 -->

##### NodeException

Node.js `ErrnoException` 类型，附带泛型错误码 `T`。

**类型:** `type NodeException<T extends LinuxErrorCode | NodeErrorCode = any> = NodeJS.ErrnoException & { code: T }`

---

##### OpenSSLException

OpenSSL 错误接口，包含 `opensslErrorStack`、`function`、`library`、`reason` 等字段。

---

##### isModuleResolutionError

判断错误是否为模块解析失败 (`MODULE_NOT_FOUND` 或 `ERR_MODULE_NOT_FOUND`)。

**类型:** `(ex: unknown) => ex is NodeException<...>`

---

##### isNotExistsError

判断错误是否为文件不存在 (`ENOENT`)。

**类型:** `(e: unknown) => e is NodeException<LinuxErrorCode.ENOENT>`

---

##### isExistsError

判断错误是否为文件已存在 (`EEXIST`)。

---

##### isFileTypeError

判断错误是否为文件类型错误 (`EISDIR` 或 `ENOTDIR`，即对目录执行文件操作或反之)。

---

##### isNodeError

判断错误是否为 Node.js `ErrnoException` (有 `code` 字符串属性)。

**类型:** `(e: unknown) => e is NodeException`
