import {InsightError} from "../../controller/IInsightFacade";
import {EMPTY_STRING, Nullable} from "../../types/Constants";
import * as QueryTypes from "../../types/Query";
import {match} from "../../types/Result";
import {Logging} from "../../utils/logger/LogManager";
import {InsightQueryNode} from "./InsightQueryNode";
import {ParseToAST} from "./ParseToAST";
import * as Validate from "./validateUtils";

Logging.registerConsoleLogger();
const log = Logging.getLogger();

export default class QueryParser {
	public error: Nullable<InsightError> = null;
	public query: Nullable<InsightQueryNode> = null;
	public datasetId: string = EMPTY_STRING;

	private transformationsGroup: string[] = [];
	private applyKeys: string[] = [];
	private _hasTransformations: boolean = false;
	private datasetType: Nullable<QueryTypes.DatasetTypes> = null;
	private parse: ParseToAST = new ParseToAST();

	// set this.error to error and exit
	private exit = match<any, InsightError, boolean, boolean>({
		ok: (v) => false,
		err: (e) => {
			this.error = e;
			return true;
		}
	});

	public isValidQuery(query: unknown): query is QueryTypes.Query {
		this.clear();
		if (this.exit(Validate.checkJSObjectAndHasKeys(query, ["WHERE", "OPTIONS"], ["TRANSFORMATIONS"], "Query"))){
			return false;
		}
		if (this.exit(Validate.checkJSObject((query as any)["WHERE"]))) {
			return false;
		};
		if (this.exit(Validate.checkJSObject((query as any)["OPTIONS"]))) {
			return false;
		};
		if ((query as any)["TRANSFORMATIONS"]) {
			if (this.exit(Validate.checkJSObject((query as any)["TRANSFORMATIONS"]))) {
				return false;
			};
			this._hasTransformations = true;
		}
		let qq = query as {
            WHERE: object,
            OPTIONS: object,
			TRANSFORMATIONS?: object
        };
		if (qq["TRANSFORMATIONS"]) {
			if (!this.isValidTransformations(qq["TRANSFORMATIONS"])) {
				return false;
			}
			this.transformationsGroup = (qq["TRANSFORMATIONS"] as any)["GROUP"] as string[];
		}
		if (!this.isValidOptions(qq["OPTIONS"])) {
			return false;
		}
		return match<InsightQueryNode, InsightError, boolean, boolean>({
			ok: (v) => {
				this.query = v;
				return true;
			},
			err: (e) => {
				this.error = e;
				return false;
			}
		})(this.parse.parseWhere(qq.WHERE, this.datasetId, this.datasetType as QueryTypes.DatasetTypes));
	}

	private clear() {
		this.error = null;
		this.datasetId = EMPTY_STRING;
		this.applyKeys = [];
		this.transformationsGroup = [];
		this._hasTransformations = false;
		this.datasetType = null;
	}

	public hasTransformations(): boolean {
		return this._hasTransformations;
	}

	private isValidOptions(options: object) {
		if (this.exit(Validate.checkJSObjectAndHasKeys(options, ["COLUMNS"], ["ORDER"], "OPTIONS"))) {
			return false;
		};
		if(!this.isValidColumns((options as any)["COLUMNS"])) {
			return false;
		}
		let o = options as {
            COLUMNS: QueryTypes.QueryKey[],
            ORDER?: unknown
        };
		if (Object.keys(o).includes("ORDER")) {
			if (this.exit(Validate.isValidOrder(o.ORDER, o.COLUMNS, this.datasetId))) {
				return;
			};
		}
		return true;
	}

	private isValidColumns(columns: unknown): boolean {
		if (this.exit(Validate.checkNonEmptyArray(columns, "string", "COLUMNS"))) {
			return false;
		};
		for (let key of columns as string[]) {
			if (this._hasTransformations) {
				if (!this.applyKeys.includes(key) && !this.transformationsGroup.includes(key)) {
					let errMsg = "Keys in COLUMNS must be in GROUP or APPLY when TRANSFORMATIONS is present";
					this.error = new InsightError(errMsg);
					return false;
				}
			} else {
				if (!this.isValidKey(key)) {
					this.error = new InsightError(`Invalid key in COLUMNS ${key}`);
					return false;
				}
			}
		}
		return true;
	}

	private isValidTransformations(transformations: object): boolean {
		if (this.exit(Validate.checkJSObjectAndHasKeys(transformations, ["GROUP", "APPLY"], [], "TRANSFORMATIONS"))) {
			return false;
		};
		let t = transformations as {
			GROUP: unknown,
			APPLY: unknown
		};
		if (!this.isValidGroup(t.GROUP)) {
			return false;
		}
		if (!this.isValidApply(t.APPLY)) {
			return false;
		}
		return true;
	}

	private isValidGroup(group: unknown): boolean {
		if (this.exit(Validate.checkNonEmptyArray(group, "string", "GROUP"))) {
			return false;
		};
		let g = group as string[];
		for (let key of g) {
			if (!this.isValidKey(key)) {
				this.error = new InsightError(`Invalid key ${key} in GROUP`);
				return false;
			}
		}
		return true;
	}

	private isValidApply(apply: unknown): boolean {
		if (this.exit(Validate.checkArray(apply, null, "APPLY"))) {
			return false;
		};
		let a = apply as any[];
		for (let elem of a) {
			if (this.exit(Validate.checkJSObjectAndNumKeys(elem, 1, "APPLYRULE"))) {
				return false;
			};
			let applyKey = Object.keys(elem)[0];
			if (!this.isValidApplyKey(applyKey)) {
				return false;
			}
			if (!this.isValidApplyRule(elem[applyKey])) {
				return false;
			}
		}
		return true;
	}

	private isValidApplyKey(applyKey: string): boolean {
		if (!Validate.isValidApplyKey(applyKey)) {
			this.error = new InsightError("Invalid APPLYKEY");
			return false;
		}
		if (this.applyKeys.includes(applyKey)) {
			this.error = new InsightError("Duplicate APPLYKEYS");
			return false;
		}
		this.applyKeys.push(applyKey);
		return true;
	}

	private isValidApplyRule(rule: unknown): boolean {
		if (this.exit(Validate.checkJSObjectAndNumKeys(rule, 1, "APPLYRULE"))) {
			return false;
		};
		let applyToken = Object.keys(rule as object)[0];
		if (!Validate.isValidApplyToken(applyToken)) {
			this.error = new InsightError(`Invalid apply token ${applyToken}`);
			return false;
		}
		let key = (rule as any)[applyToken];
		if (Validate.isValidMApplyToken(applyToken)) {
			if (!this.isValidKey(key, QueryTypes.KeyType.MATH)) {
				this.error = new InsightError(`${applyToken} can only take math fields`);
				return false;
			}
		} else {
			if (!this.isValidKey(key)) {
				this.error = new InsightError(`Invalid key ${key}`);
			}
		}
		return true;
	}

	/**
	 * @important is this checking for valid datasetid (not only whitespace)???
	 * technically, it doesn't need to since a empty dataset id cannot be added
	 */
	private isValidKey(kkey: unknown, type: QueryTypes.KeyType | "_ANY" = "_ANY"): boolean {
		let res = Validate.isValidKey(kkey, type);
		if (!res.ok) {
			return false;
		}
		let key = kkey as string;
		let [datasetId, datasetKey] = key.split("_");
		if (!this.isSameDataset(datasetId)) {
			return false;
		}
		return this.isConsistentField(datasetKey as QueryTypes.ValidField);
	}

	private isSameDataset(datasetId: string): boolean {
		if (this.datasetId === EMPTY_STRING) {
			this.datasetId = datasetId;
		} else {
			if (datasetId !== this.datasetId) {
				this.error = new InsightError(`Cannot query multiple datasets ${datasetId} and ${this.datasetId}`);
				return false;
			}
		}

		return true;
	}

	private isConsistentField(datasetKey: QueryTypes.ValidField): boolean {
		let dtype: QueryTypes.DatasetTypes = Validate.getFieldType(datasetKey);
		if (!this.datasetType) {
			this.datasetType = dtype;
		}
		return this.datasetType === dtype;
	}

	public getDatasetType(): QueryTypes.DatasetTypes {
		return this.datasetType as QueryTypes.DatasetTypes;
	}
}
