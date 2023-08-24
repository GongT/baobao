export const isTTY = process.stderr.isTTY;
export const columns = Math.max(process.stderr.columns || Infinity, 80);
