const enabled = !!process.env.DEBUG || process.argv.includes('-d');

function noop(_1: string, ..._2: any[]) {}

export const debug = enabled ? console.error.bind(console) : noop;
