export function die(msg: string, ...args: any[]) {
	console.error(msg, ...args);
	console.error(UsageString);
	process.exit(1);
}
export function usage() {
	console.error(UsageString);
	process.exit(1);
}

const UsageString = `Usage: mysql-docgen [OPTIONS] [database]
Default config is get by running command "mysql --print-defaults"
If "mysql" command is not in PATH, only these config has default:
 * host is localhost
 * port is 3306
The [database] is required!

program config:
  -O, --output-dir          Folder for store output files.

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
`;
