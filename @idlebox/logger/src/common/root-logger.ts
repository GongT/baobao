import process from "node:process";
import type { IBasicLogger } from "./types.js";

const rootLoggerTag = process.env.LOGGER_NAME || getLoggerName();
export const terminal: IBasicLogger = {
	log: debug("idlebox:log"),
	info: debug("idlebox:info"),
	warn: debug("idlebox:warn"),
	error: debug("idlebox:error"),
	debug: debug("idlebox:debug"),
	verbose: debug("idlebox:verbose"),
};

function getLoggerName(){

}
