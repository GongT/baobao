export const controlCharacters = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g; // 除了 \t \n \r 之外的控制字符
export const csiSequence = /\x1B\[[\x30–\x3F]*[\x20-\x2F]*[\x40-\x7E]/g; // ANSI CSI序列
export const oscSequence = /\x1B\][^\x1B\x07]*(\x1B\\|\x07)/g; // ANSI OSC序列
export const pmApcSequence = /\x1B[_^][^\x1B\x07]*\x1B\\/g; // ANSI PM/APC序列
export const dcsSequence = /\x1B[\x20-\x7E\x08-\x0D]*\x1B\\/g; // ANSI DCS序列
export const sosSequence = /\x1B[\s\S]+?\x1B\\/g; // ANSI SOS序列
export const otherC1 = /\x1B[\x80-\x9F]/g; // 其他C1控制字符

/**
 * 所有已知的控制序列的正则表达式，用于从字符串中剥离这些序列以获得纯文本内容
 */
export const combinedSequence = new RegExp(
	[csiSequence.source, oscSequence.source, pmApcSequence.source, dcsSequence.source, sosSequence.source, otherC1.source, controlCharacters.source].join('|'),
	'g',
);

/**
 * 终端设备报告行和列的DSR序列的正则表达式
 */
export const DSR_RSP = /\x1B\[(\d+);(\d+)R/;
