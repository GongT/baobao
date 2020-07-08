# sql-docgen

生成 MySQL 文档，用于我自己的微服务系统。

#### 安装

```bash
yarn global add @gongt/mysql-docgen
```

#### 使用

```bash
cd /path/to/project
microservice-mysql-docgen -uroot -p123456 -h127.0.0.1 -p3306 project_database_name
```

#### 参数

```text
Usage: mysql-docgen [OPTIONS] [database]
Default config is get by running command "mysql --print-defaults"
If "mysql" command is not in PATH, only these config has default:
 * host is localhost
 * port is 3306
The [database] is required!

program config:
  -d, --dist                Folder for store output files.

mysql connection config:
  -h, --host=name           Connect to host.
  -P, --port=#              Port number to use for connection.
  -S, --socket=name         The socket file to use for connection.
  -u, --user=name           User for login if not current user.
  -p, --password[=name]     Password to use when connecting to server. If password is
                            not given it's asked from the tty.
  --connect-timeout=#       Number of seconds before connection timeout.
  --secure-auth             Refuse client connecting to server if it uses old
							(pre-4.1.1) protocol.
// TODO: add ssl config
```
