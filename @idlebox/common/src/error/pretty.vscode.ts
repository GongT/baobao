/*
===================
echo $VSCODE_SHELL_INTEGRATION_SHELL_SCRIPT
===================

__vsc_escape_value_fast() {
	builtin local LC_ALL=C out
	out=${1//\\/\\\\}
	out=${out//;/\\x3b}
	builtin printf '%s\n' "${out}"
}

__vsc_escape_value() {
	# If the input being too large, switch to the faster function
	if [ "${#1}" -ge 2000 ]; then
		__vsc_escape_value_fast "$1"
		builtin return
	fi

	# Process text byte by byte, not by codepoint.
	builtin local -r LC_ALL=C
	builtin local -r str="${1}"
	builtin local -ir len="${#str}"

	builtin local -i i
	builtin local -i val
	builtin local byte
	builtin local token
	builtin local out=''

	for (( i=0; i < "${#str}"; ++i )); do
		# Escape backslashes, semi-colons specially, then special ASCII chars below space (0x20).
		byte="${str:$i:1}"
		builtin printf -v val '%d' "'$byte"
		if  (( val < 31 )); then
			builtin printf -v token '\\x%02x' "'$byte"
		elif (( val == 92 )); then # \
			token="\\\\"
		elif (( val == 59 )); then # ;
			token="\\x3b"
		else
			token="$byte"
		fi

		out+="$token"
	done

	builtin printf '%s\n' "$out"
}

builtin printf '\e]633;P;Cwd=%s\a' "$(__vsc_escape_value "$__vsc_cwd")"

*/

/**
 * 该函数用于对字符串进行转义
 * 转义规则如下：
 * - 反斜杠会被转义为两个反斜杠
 * - 分号会被转义为\x3b
 * - ASCII码小于0x20的字符会被转为\xXX格式的十六进制
 * - 其他字符保持不变
 * 当输入字符串长度大于等于2000时，使用快速转义函数
 * 返回转义后的字符串
 */
export function vscEscapeValue(input: string): string {
	if (input.length >= 2000) {
		return vscEscapeValueFast(input);
	}

	let out = '';
	for (let i = 0; i < input.length; ++i) {
		const code = input.charCodeAt(i);
		const char = input[i];
		if (code < 31) {
			out += `\\x${code.toString(16).padStart(2, '0')}`;
		} else if (code === 92) {
			out += '\\\\';
		} else if (code === 59) {
			out += '\\x3b';
		} else {
			out += char;
		}
	}
	return out;
}

/**
 * 快速转义函数
 * 仅处理反斜杠和分号
 * 返回转义后的字符串
 */
function vscEscapeValueFast(input: string): string {
	return input.replace(/\\/g, '\\\\').replace(/;/g, '\\x3b');
}
