import {CourseSection} from "../../types/CourseSection";
import {RoomDataset, SectionDataset} from "../../types/Dataset";
import {
	Comparator,
	CompFunc, MatchFunc, ValidField
} from "../../types/Query";
import {Room} from "../../types/Room";
import {XOR} from "../../types/XOR";
import {InsightQueryNode} from "./InsightQueryNode";

// query runner functions
// could replace arrays with sets since set.has() has constant lookup

// NOTE: cor(s) = course section(s) or room(s)

export class QueryRunner {
	public ret: any[];
	private comparatorFuncMap: Map<Comparator, CompFunc> = new Map();
	private matchLT = (a: string | number, e: string | number) => a < e;
	private matchGT = (a: string | number, e: string | number) => a > e;
	private matchEQ = (a: string | number, e: string | number) => a === e;
	private matchIS = (a: string | number, e: string | number) => (a as string).match(new RegExp(`${e}`)) !== null;

	constructor() {
		this.ret = [];
		this.comparatorFuncMap = new Map([
			["LT", this.runX(this.matchLT)],
			["GT", this.runX(this.matchGT)],
			["EQ", this.runX(this.matchEQ)],
			["IS", this.runX(this.matchIS)],
		]);
	}

	public runQuery(query: InsightQueryNode, ds: XOR<SectionDataset, RoomDataset>):
	Array<XOR<CourseSection, Room>> {
		// reset state
		this.ret = [];
		let allCors: Array<XOR<CourseSection, Room>> = [];
		let key = Object.keys(ds);
		for (let cors of (ds as any)[key[1]]) {
			for (let cor of Object.values(cors)[0] as Array<XOR<CourseSection, Room>>) {
				allCors.push(cor);
			}
		}
		let queryResult = this._runQuery(query, allCors, false);
	   	return queryResult;
	}

	private _runQuery(query: InsightQueryNode, cors: Array<XOR<CourseSection, Room>>, isNegated: boolean):
	Array<XOR<CourseSection, Room>> {
		let queryCmp = query.getComparator();
		let queryType = query.getType();
		this.ret = [];

		if (queryType === "MCOMPARISON" || queryType === "SCOMPARISON"){

			let func: CompFunc = this.comparatorFuncMap.get(queryCmp as Comparator) as CompFunc;
			this.ret = func(query, cors, isNegated);

		} else if (queryType === "LOGICCOMPARISON") {

			if ((queryCmp === "AND" && !isNegated) || (queryCmp === "OR" && isNegated)){
				let filters = query.getFilters();
				let filteredCors = cors;
				for (let filter of filters) {
					filteredCors = this._runQuery(filter, filteredCors, isNegated);
				}
				return filteredCors;

			} else if ((queryCmp === "OR" && !isNegated) || (queryCmp === "AND" && isNegated)) {

				let filters = query.getFilters();
				let setUnionCors: Set<any> = new Set();
				let filteredCors: Array<XOR<CourseSection, Room>> = [];
				for (let filter of filters){
					filteredCors = this._runQuery(filter, cors, isNegated);
					filteredCors.forEach(setUnionCors.add, setUnionCors);
				}
				return Array.from(setUnionCors);
			}

		} else if (queryType === "NEGATION") {
			let filters = query.getFilters();
			for (let filter of filters) {
				return this._runQuery(filter, cors, !isNegated);
			}

		} else if (queryType === "_ALL") {
			for (let cor of cors) {
				this.ret.push(cor);
			}
		}
		return this.ret;
	}

	private runX(match: MatchFunc): CompFunc {
		return function(query: InsightQueryNode, cors: Array<XOR<CourseSection, Room>>, isNegated: boolean):
		Array<XOR<CourseSection, Room>> {
			let ret: Array<XOR<CourseSection, Room>> = [];
			for (let cor of cors) {
				let actual = cor[query.getField() as ValidField] as string | number;
				let expected = query.getValue() as string | number;
				if (isNegated) {
					if (!match(actual, expected)) {
						ret.push(cor);
					}
				} else if (match(actual, expected)) {
					ret.push(cor);
				}
			}
			return ret;
		};
	}
}
