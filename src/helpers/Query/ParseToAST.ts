import {InsightError} from "../../controller/IInsightFacade";
import {Nullable} from "../../types/Constants";
import {Comparator, DatasetTypes, KeyType, ValidField} from "../../types/Query";
import {_err, ok, Result} from "../../types/Result";
import {Logging} from "../../utils/logger/LogManager";
import {InsightQueryNode} from "./InsightQueryNode";
import {isValidComparator, isValidKeyAndIsConsistent} from "./validateUtils";


// Validates WHERE and parse into an AST

Logging.registerConsoleLogger();
const log = Logging.getLogger();

// REFACTOR to use to new validation helpers (checkJSObject, etc)

export class ParseToAST {
	private currentDataset: string = "";
	private dtype: Nullable<DatasetTypes> = null;

	public parseWhere(where: object, seen: string, _dtype: DatasetTypes): Result<InsightQueryNode, InsightError> {
		this.currentDataset = seen;
		this.dtype = _dtype;

		if (Object.keys(where).length === 0) {
			return ok(new InsightQueryNode("_ALL", seen));
		}
		return this.parseFilter(where, "WHERE");
	}

	private parseFilter(filter: object, from: string): Result<InsightQueryNode, InsightError> {
		let keys = Object.keys(filter);
		if (keys.length === 0) {
			return _err(new InsightError(`${from} can only have 1 key, has 0`));
		}
		if (keys.length > 1) {
			return _err(new InsightError(`${from} can only have 1 key, has ${keys.length}`));
		}
		if (!isValidComparator(keys[0])) {
			return _err(new InsightError(`Unrecognized comparator ${keys[0]}`));
		}
		let w = filter as any;
		let op = keys[0] as Comparator;
		switch (op) {
			case "IS":
				return this.parseSComp(w[keys[0]]);
			case "AND":
			case "OR":
				return this.parseLogic(w[op], op);
			case "LT":
			case "GT":
			case "EQ":
				return this.parseMComp(w[op], op);
			case "NOT":
				return this.parseNot(w[op]);

		}
	}

	private parseSComp(condition: unknown): Result<InsightQueryNode, InsightError> {
		if (typeof condition !== "object") {
			return _err(new InsightError("Invalid query - IS not an object"));
		}
		let c = condition as object;
		let keys = Object.keys(c);

		if (Object.keys(c).length === 0) {
			return _err(new InsightError("Invalid query - empty IS object"));
		}
		if (Object.keys(c).length > 1) {
			return _err(new InsightError("Additoinal keys in scomp"));
		}

		// check if key is valid (the sections_dept) part
		let res = isValidKeyAndIsConsistent(keys[0], KeyType.STRING, this.currentDataset, this.dtype as DatasetTypes);
		if (!res.ok) {
			return _err(res.error);
		}

		// check if value is string
		if (typeof (c as any)[keys[0]] !== "string") {
			return _err(new InsightError("IS value must be a string"));
		}

		// check for invalid wildcards
		if ((c as any)[keys[0]].slice(1, -1).includes("*")) {
			return _err(new InsightError("IS value cannot have wildcard other than at the start or end"));
		}

		let curr = (c as any)[keys[0]] as string;
		let rx = this.handleWildcards(curr);
		let datasetId  = keys[0].split("_")[0];
		let datasetKey = keys[0].split("_")[1];

		return ok(new InsightQueryNode("SCOMPARISON", datasetId, rx, "IS", datasetKey as ValidField));
	}

	private parseMComp(condition: unknown, cmp: string): Result<InsightQueryNode, InsightError> {
		if (typeof condition !== "object") {
			return _err(new InsightError(`Invalid query - ${cmp} not an object`));
		}
		let c = condition as object;
		let keys = Object.keys(c);

		if (Object.keys(c).length === 0) {
			return _err(new InsightError(`Invalid query - empty ${cmp}`));
		}
		if (Object.keys(c).length > 1) {
			return _err(new InsightError(`Additoinal keys in ${cmp}`));
		}

		// check if s_key is valid
		let res = isValidKeyAndIsConsistent(keys[0], KeyType.MATH, this.currentDataset, this.dtype as DatasetTypes);
		if (!res.ok) {
			return _err(res.error);
		}

		// check if value is number
		if (typeof (c as any)[keys[0]] !== "number") {
			return _err(new InsightError(`${cmp} value must be a number`));
		}

		let datasetId  = keys[0].split("_")[0];
		let datasetKey = keys[0].split("_")[1];

		// if it is valid
		let cc = c as any;

		return ok(new InsightQueryNode("MCOMPARISON", datasetId, cc[keys[0]], cmp as Comparator,
		 datasetKey as ValidField));
	}

	private parseLogic(conditions: unknown, op: string): Result<InsightQueryNode, InsightError> {
		if (!Array.isArray(conditions)) {
			return _err(new InsightError(`${op} must be an array`));
		}
		if ((conditions as any[]).length === 0) {
			return _err(new InsightError(`${op} must have atleast one condition`));
		}
		let ret = new InsightQueryNode("LOGICCOMPARISON", null, null, op as Comparator);
		for (let cond of conditions) {
			let filter = this.parseFilter(cond, op);
			if (!filter.ok) {
				return _err(filter.error);
			}
			ret.addFilter(filter.value);
		}
		return ok(ret);
	}

	private parseNot(conditions: unknown): Result<InsightQueryNode, InsightError>{
		if (typeof conditions !== "object") {
			return _err(new InsightError("Invalid query"));
		}
		if (Array.isArray(conditions)) {
			return _err(new InsightError("NOT cannot be an array"));
		}
		let keys = Object.keys(conditions as object).length;
		if (keys > 1 || keys === 0) {
			return _err(new InsightError(`NOT should only have one key, has ${keys}`));
		}
		let ret = new InsightQueryNode("NEGATION", null, null, "NOT");
		let parsed = this.parseWhere(conditions as object, this.currentDataset, this.dtype as DatasetTypes);
		if (!parsed.ok) {
			return parsed;
		}
		ret.addFilter(parsed.value);
		return ok(ret);
	}

	private checkWildCardPosition(str: string): [boolean, boolean] {
		let first = str.substring(0,1);
		let last  = str.slice(-1);
		if (first === "*" && last === "*") {
			return [true, true];
		}
		if (first === "*") {
			return [true, false];
		}
		if (last === "*") {
			return [false, true];
		}
		return [false, false];
	}

	private handleWildcards(curr: string): string {
		let rx;
		if (curr === "*" || curr === "**") {
			rx = "";
		} else {
			let [start, end] = this.checkWildCardPosition(curr);
			if (start && end) {
				rx = curr.slice(1, -1);
			} else if (start) {
				rx = `${curr.substring(1)}$`;
			} else if (end) {
				rx = `^${curr.slice(0, -1)}`;
			} else {
				rx = `^${curr}$`;
			}
		}
		return rx;
	}
}
