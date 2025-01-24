import Decimal from "decimal.js";
import {InsightResult, ResultTooLargeError} from "../../controller/IInsightFacade";
import {EMPTY_STRING} from "../../types/Constants";
import {CourseSection} from "../../types/CourseSection";
import * as QTypes from "../../types/Query";
import {ok, Result, _err} from "../../types/Result";
import {Room} from "../../types/Room";
import {XOR} from "../../types/XOR";
import {chainedSort, getCmp, getField, sortBy} from "../../utils/Utils";
import {Logging} from "../../utils/logger/LogManager";
import {isValidApplyKey} from "./validateUtils";

// query result transformation methods
// grouping, ordering, calculations

Logging.registerConsoleLogger();
const log = Logging.getLogger();

// also needs a clear function
export class QueryTransform {
	private result: Array<XOR<CourseSection, Room>>;
	private groupMap: Map<string, Array<XOR<CourseSection, Room>>>;
	private transformations: QTypes.Transformations;
	private hasTransformations: boolean = false;
	private hasOrder: boolean = false;
	private options: QTypes.Options;
	private applyRules: QTypes.ApplyObject[] = [];
	private appliedResults = new Map<string, Map<string, number>>();
	private groupData = new Map<string, Array<string | number>>();
	private tooLargeError = new ResultTooLargeError("Result more than 5000 lines");
	private ret: InsightResult[] = [];

	constructor(result: Array<XOR<CourseSection, Room>>, query: QTypes.Query) {
		this.result = result;
		this.transformations = query["TRANSFORMATIONS"] as QTypes.Transformations;
		if (this.transformations) {
			this.hasTransformations = true;
			for (let apply of this.transformations.APPLY) {
				this.applyRules.push(this.getApply(apply));
			}
		}
		this.options = query["OPTIONS"] as QTypes.Options;
		if (this.options.ORDER) {
			this.hasOrder = true;
		}
		this.groupMap = new Map<string, Array<XOR<CourseSection, Room>>>();
	}

	public performTransformations(): Result<InsightResult[], ResultTooLargeError> {
		if (this.hasTransformations) {
		    this.groupResults();
		    this.performCalculations();
		}
		let isTooLarge = this.filterColumns();
		if (!isTooLarge.ok) {
			return isTooLarge;
		};
		if (this.hasOrder) {
			this.orderResults();
		}
		return ok(this.ret);
	}

	private groupResults() {
		for (let result of this.result) {
			let key = this.getGroupKey(result);
			if (this.groupMap.has(key)) {
				let prev = this.groupMap.get(key) as Array<XOR<CourseSection, Room>>;
				this.groupMap.set(key, [...prev, result]);
			} else {
				this.groupMap.set(key, [result]);
			}
		}
	}

	private filterColumns(): Result<null, ResultTooLargeError> {
		if (this.hasTransformations) {
			for (let [k, v] of this.groupData) {
				let ret: any = {};
				for (let column of this.options.COLUMNS) {
					let idx = this.transformations.GROUP.indexOf(column);
					if (idx !== -1) {
						ret[column] = v[idx];
					} else {
						let calcs = this.appliedResults.get(k) as Map<string, number>;
						ret[column] = calcs.get(column);
					}
				}
				this.ret.push(ret);
				if (this.tooLarge(this.ret)) {
					return _err(this.tooLargeError);
				};
			}
		} else {
			for (let res of this.result) {
				let ret: any = {};
				for (let column of this.options.COLUMNS) {
					let field = getField(column) as QTypes.ValidField;
					ret[column] = res[field];
				}
				this.ret.push(ret);
				if (this.tooLarge(this.ret)) {
					return _err(this.tooLargeError);
				};
			}
		}

		return ok(null);
	}

	private tooLarge(a: any[]): boolean {
		return a.length > 5000;
	}

	private orderResults(): any[] {
		let order = this.options.ORDER as QTypes.Order;
		if (typeof order === "string") {
			return this.ret.sort(getCmp(order, 0));
		}
		let dir = order.dir === "UP" ? 0 : 1;
		let comparators: QTypes.SortFunction[] = [];
		for (let key of order.keys) {
			if (!isValidApplyKey(key)) {
			    comparators.push(getCmp(key, dir));
			} else {
				comparators.push(sortBy(key, dir));
			}
		}
		return this.ret.sort(chainedSort(...comparators));
	}

	private getGroupKey(res: XOR<CourseSection, Room>) {
		let groupKey = EMPTY_STRING;
		let arr = [];
		for (let key of this.transformations.GROUP) {
			let field = getField(key) as QTypes.ValidField;
			if (groupKey === EMPTY_STRING) {
				groupKey += res[field];
			} else {
				groupKey += `%_% ${res[field]}`;
			}
			arr.push(res[field] as string | number);
		}
		this.groupData.set(groupKey, arr);
		return groupKey;
	}

    // if apply rules are present, each group corresponds to one entry in
    // output result array
	private performCalculations() {
		for (let [k, v] of this.groupMap) {
			let applied = new Map<string, number>();
			for (let apply of this.applyRules) {
				let {APPLYKEY: akey, APPLYTOKEN: atoken, QUERYKEY: qkey} = apply;
				let field = getField(qkey);
				let decimal = new Decimal(0);
				let value = 0;
				switch(atoken) {
					case "COUNT":
						value = v.reduce((a, c) => a + 1, 0);
						applied.set(akey, value);
						break;
					case "AVG":
						for (let i of v) {
							decimal = Decimal.add(new Decimal(i[field] as number), decimal);
						}
						applied.set(akey, Number((decimal.toNumber() / v.length).toFixed(2)));
						break;
					case "MAX":
						value = v[0][field] as number;
						for (let i of v) {
							value = i[field] as number > value ? i[field] as number : value;
						}
						applied.set(akey, value);
						break;
					case "MIN":
						value = v[0][field] as number;
						for (let i of v) {
							value = i[field] as number < value ? i[field] as number : value;
						}
						applied.set(akey, value);
						break;
					case "SUM":
						value = v.reduce((a: any, c: any) => a + (c[field] as number), 0);
						applied.set(akey, Number(value.toFixed(2)));
						break;
				}
			}
			this.appliedResults.set(k, applied);
		}
	}

	private getApply(obj: any): QTypes.ApplyObject {
		let ret: any = {};
		ret["APPLYKEY"] = Object.keys(obj)[0];
		ret["APPLYTOKEN"] = Object.keys(obj[ret["APPLYKEY"]])[0];
		ret["QUERYKEY"] = obj[ret["APPLYKEY"]][ret["APPLYTOKEN"]];
		return ret;
	}
}
