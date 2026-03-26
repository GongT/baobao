const $oid = /^[a-f\d]{24}$/i;
export const isValidObjectId = (id: string) => $oid.test(id);
