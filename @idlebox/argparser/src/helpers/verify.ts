const validLong = /^[^a-z0-9@\$][^@\$a-z0-9_\.:-]$/i;
export function verifyLong(v: string) {
	if (v.length < 2) {
		throw new Error(`invalid long option name: ${v} (must at least 2 chars)`);
	}
	if (!validLong.test(v)) {
		throw new Error(`invalid long option name: ${v} (must match ${validLong})`);
	}
}
const validShort = /^[^a-z0-9@\$]$/i;
export function verifyShort(v: string) {
	if (v.length !== 1) {
		throw new Error(`invalid short option name: ${v} (must 1 char)`);
	}
	if (!validShort.test(v)) {
		throw new Error(`invalid long option name: ${v} (must match ${validShort})`);
	}
}
