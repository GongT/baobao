/** @public */
function escapeRegExpPatch(str: string) {
	return str.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&');
}
export const escapeRegExp = RegExp.escape ?? escapeRegExpPatch;
