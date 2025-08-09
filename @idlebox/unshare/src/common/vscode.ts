export function detectVsCode() {
	const OPTS = process.env.NODE_OPTIONS || '';
	if (!OPTS) return '';

	const m = vscodeRemoteAttachScript.exec(OPTS);
	if (m) return m[1]!;
	return '';
}
const vscodeRemoteAttachScript = /--require (.+)\/data\/.+ms-vscode\.js-debug\//;
