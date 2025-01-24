import {InsightQueryNode} from "../helpers/Query/InsightQueryNode";
import QueryParser from "../helpers/Query/QueryParser";
import {QueryRunner} from "../helpers/Query/QueryRunner";
import {QueryTransform} from "../helpers/Query/QueryTransform";
import {Nullable} from "../types/Constants";
import {RoomDataset, SectionDataset} from "../types/Dataset";
import {Query} from "../types/Query";
import {ok, Result, _err} from "../types/Result";
import {XOR} from "../types/XOR";
import DatasetController from "./DatasetController";
import {InsightError, InsightResult} from "./IInsightFacade";

export class QueryFacade {
	private queryParser: QueryParser;
	private queryRunner: QueryRunner;
	private datasetController: DatasetController;
    // head of ast
	private query: Nullable<InsightQueryNode> = null;

	constructor(dc: DatasetController) {
		this.queryParser = new QueryParser();
		this.queryRunner = new QueryRunner();
		this.datasetController = dc;
	}

	private parseQuery(query: unknown): Result<null, Promise<any>> {
		if (!this.queryParser.isValidQuery(query)) {
			return _err(Promise.reject(this.queryParser.error as InsightError));
		} else {
			this.query = this.queryParser.query as InsightQueryNode;
			return ok(null);
		}
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		let isValid = this.parseQuery(query);
		if(!isValid.ok) {
			return isValid.error;
		}
		let datasetId = this.queryParser.datasetId;
		let dataset = this.datasetController.getDataset(datasetId);
		let result;
		if (dataset) {
			let q = this.query as InsightQueryNode;
			let ds = dataset as XOR<SectionDataset, RoomDataset>;
			result = this.queryRunner.runQuery(q, ds);
		} else {
			return Promise.reject(new InsightError(`Dataset with id ${datasetId} doesn't exist`));
		}
		let qTransform = new QueryTransform(result, query as Query);
		let isTooBig = qTransform.performTransformations();
		if (!isTooBig.ok) {
			return Promise.reject(isTooBig.error);
		}
		return Promise.resolve(isTooBig.value as InsightResult[]);
	}
}
