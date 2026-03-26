/**
 * Control Sequence Introducer
 */
export const CSI: string = '\x1b[';
/**
 * Operating System Command
 */
export const OSC: string = '\x1b]';
/**
 * Device Control String
 */
export const DCS: string = '\x1bP';
/**
 * String Terminator
 */
export const ST: string = '\x1b\\';
/**
 * Application Program Command
 */
export const APC: string = '\x1b_';
/**
 * Device Status Report
 */
export const DSR = `${CSI}6n`;
