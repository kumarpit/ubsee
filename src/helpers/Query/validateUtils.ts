import {InsightError} from "../../controller/IInsightFacade";
import {JSTypes, Nullable} from "../../types/Constants";
import * as QTypes from "../../types/Query";
import {ok, Result, _err} from "../../types/Result";
import {countOccurences} from "../../utils/Utils";

// functions to help validate queries

export function isValidOrder(order: unknown, columns: QTypes.QueryKey[], seen: string): Result<null, InsightError> {
	if (typeof order === "object") {
		let res = checkJSObjectAndHasKeys(order, ["dir", "keys"], [], "ORDER");
		if (!res.ok) {
			return res;
		}
		let oo = order as {
            dir: unknown,
            keys: unknown
        };
		if (!isDirection(oo["dir"])) {
			return _err(new InsightError("dir can only be UP or DOWN"));
		}
		res = checkNonEmptyArray(oo["keys"], "string", "ORDER KEYS");
		if (!res.ok) {
			return res;
		}
		let ooo = order as {
            dir: QTypes.Direction,
            keys: string[];
        };
		for (let key of ooo["keys"]) {
			if (!columns.includes(key as QTypes.QueryKey)) {
				return _err(new InsightError("All ORDER keys must be one of COLUMNS"));
			}
		}
		return ok(null);
	}
	return isValidOrderString(order, columns, seen);
}

function isValidOrderString(order: unknown, columns: QTypes.QueryKey[], seen: string): Result<null, InsightError> {
	if (typeof order !== "string") {
		return _err(new InsightError("ORDER can either be a string or an object"));
	}
	if (!columns.includes(order as QTypes.QueryKey)) {
		return _err(new InsightError("ORDER key must be in COLUMNS"));
	}
	return ok(null);
}

/**
 * @returns true if dir is "UP" | "DOWN"
 */
export function isDirection(dir: unknown): dir is QTypes.Direction {
	if (typeof dir !== "string") {
		return false;
	}
	const dirs: readonly string[] = QTypes.DIRECTION;
	return dirs.includes(dir);
}

/**
 * @returns true if string is a valid math field
 */
export function isMField(f: unknown): f is QTypes.MathField {
	if (typeof f !== "string") {
		return false;
	}
	let r: readonly string[] = QTypes.ROOM_MFIELDS;
	let s: readonly string[] = QTypes.SECTION_MFIELDS;
	return r.includes(f) || s.includes(f);
}

/**
 * @returns true if valid string field
 */
export function isSField(f: unknown): f is QTypes.StringField {
	if (typeof f !== "string") {
		return false;
	}
	let r: readonly string[] = QTypes.ROOM_SFIELDS;
	let s: readonly string[] = QTypes.SECTION_SFIELDS;
	return r.includes(f) || s.includes(f);
}

/**
 * @returns true if valid field, depending on datasetId
 */
export function isValidField(f: unknown): boolean {
	if (typeof f !== "string") {
		return false;
	}
	return isSField(f) || isMField(f);
}

export function isSectionField(f: QTypes.ValidField): f is QTypes.SectionField {
	let s: readonly string[] = QTypes.SECTION_SFIELDS;
	let m: readonly string[] = QTypes.SECTION_MFIELDS;
	return s.includes(f) || m.includes(f);
}

export function isRoomsField(f: QTypes.ValidField): f is QTypes.RoomField {
	let s: readonly string[] = QTypes.ROOM_SFIELDS;
	let m: readonly string[] = QTypes.ROOM_MFIELDS;
	return s.includes(f) || m.includes(f);
}

/**
 * @returns true if one of LT, GT, AND, OR, etc
 */
export function isValidComparator(cmp: unknown): boolean {
	if (typeof cmp !== "string") {
		return false;
	}
	const c: readonly string[] = QTypes.COMPARATORS;
	return c.includes(cmp);
}

/**
 * checks if query keys ({datasetId}_{field}) is valid and consistent with
 * other keys that have been seen so far (i.e same datasetId and type)
 */
export function isValidKeyAndIsConsistent(_key: unknown, type: QTypes.KeyType | "_ANY",
	seen: string, dtype: QTypes.DatasetTypes):
Result<null, InsightError> {
	let res = isValidKey(_key, type);
	if (!res.ok) {
		return res;
	}
	let key = _key as string;
	let [datasetId, datasetKey] = key.split("_") as [string, string];
	if (datasetId !== seen) {
		return _err(new InsightError(`Cannot query multiple datasets ${datasetId} and ${seen}`));
	}
	if (getFieldType(datasetKey as QTypes.ValidField) === dtype) {
	  return ok(null);
	}
	return _err(new InsightError(`${datasetKey} not a valid ${dtype} field`));
}

export function isValidKey(kkey: unknown, type: QTypes.KeyType | "_ANY"): Result<null, InsightError> {
	let res = isStringAndHasOneUnderscore(kkey);
	if (!res.ok) {
		return res;
	}
	let key = kkey as string;
	let [, datasetKey] = key.split("_") as [string, string];
	res = doesFieldExist(datasetKey, type);
	if (!res.ok) {
		return res;
	}
	return ok(null);
}

export function doesFieldExist(datasetKey: string, type: QTypes.KeyType | "_ANY"): Result<null, InsightError> {
	switch (type) {
		case QTypes.KeyType.MATH:
			if (!isMField(datasetKey)) {
				return _err(new InsightError(`Invalid field ${datasetKey}`));
			}
			break;

		case QTypes.KeyType.STRING:
			if (!isSField(datasetKey)) {
				return _err(new InsightError(`Invalid field ${datasetKey}`));
			}
			break;

		case "_ANY":
			if (!isValidField(datasetKey)) {
				return _err(new InsightError(`Invalid field ${datasetKey}`));
			}
			break;
	}

	return ok(null);
}

export function isStringAndHasOneUnderscore(key: unknown): Result<null, InsightError> {
	if (typeof key !== "string") {
		return _err(new InsightError("query key must be a string"));
	}
	let underscores = countOccurences(key, new RegExp("_", "g"));
	if (underscores > 1 || underscores === 0) {
		return _err(new InsightError("Invalid query key"));
	}
	return ok(null);
}

export function isValidApplyKey(applyKey: string): boolean {
	let num = countOccurences(applyKey, new RegExp("_", "g"));
	return num === 0;
}

export function isValidMApplyToken(token: string): boolean {
	const a: readonly string[] = QTypes.MAPPLY_TOKENS;
	return a.includes(token);
}

export function isValidApplyToken(token: string): boolean {
	return isValidMApplyToken(token) || token === QTypes.COUNT_APPLY_TOKEN;
}

export function checkJSObject(obj: unknown, name: string = ""): Result<null, InsightError> {
	if (obj === null || obj === undefined || typeof obj !== "object") {
		return _err(new InsightError(`${name} must be an object and not null or undefined`));
	}
	if (Array.isArray(obj)) {
		return _err(new InsightError(`${name} cannot be an array`));
	}
	return ok(null);
}

export function checkJSObjectAndNumKeys(obj: unknown, numKeys: number, name: string = ""): Result<null, InsightError> {
	let res = checkJSObject(obj, name);
	if (!res.ok) {
		return _err(res.error);
	}
	let keys = Object.keys(obj as object);
	if (keys.length > numKeys) {
		return _err(new InsightError(`Excess keys in ${name}`));
	}
	return ok(null);
}

export function checkJSObjectAndHasKeys(obj: unknown, reqKeys: string[],
	opKeys: string[] = [], name: string = ""): Result<null, InsightError> {
	let res = checkJSObject(obj, name);
	if (!res.ok) {
		return _err(res.error);
	}
	let o = obj as object;
	// check if required keys are in obj
	for (let key of reqKeys) {
		if (!(key in o)) {
			return _err(new InsightError(`Missing key ${key} in ${name}`));
		}
	}
	// count number of optional keys in obj
	let numOp = 0;
	for (let key of opKeys) {
		if (key in o) {
			numOp++;
		}
	}
	let elen = reqKeys.length + numOp;
	let alen = Object.keys(o).length;
	if (alen > elen) {
		return _err(new InsightError(`Excess/invalid keys in ${name}`));
	}
	return ok(null);
}

export function checkNonEmptyArray(
	a: unknown,
	type: Nullable<JSTypes> = null,
	name: string = ""
): Result<null, InsightError> {
	return checkArray(a, type, name, true);
}

export function checkArray(
	a: unknown,
	type: Nullable<JSTypes> = null,
	name: string = "",
	echeck: boolean = false
): Result<null, InsightError> {
	if (!Array.isArray(a)) {
		return _err(new InsightError(`${name} must be an array`));
	}
	let arr = a as any[];
	if (echeck) {
		if (arr.length === 0) {
			return _err(new InsightError(`${name} cannot be an empty array`));
		}
	}
	if (type) {
		for (let elem of arr) {
			if (typeof elem !== type) {
				return _err(new InsightError(`${name} must be an array of ${type}`));
			}
		}
	}
	return ok(null);
}


export function getFieldType(f: QTypes.ValidField): QTypes.DatasetTypes {
	if (isSectionField(f)) {
		return QTypes.SECTIONS;
	}
	return QTypes.ROOMS;
}
