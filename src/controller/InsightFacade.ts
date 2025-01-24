import DatasetController from "./DatasetController";
import {
	IInsightFacade,
	InsightDataset,
	InsightDatasetKind,
	InsightResult
} from "./IInsightFacade";
import {Logging} from "../utils/logger/LogManager";
import {QueryFacade} from "./QueryFacade";

/**
 * This is the main programmatic entry point for the project.
 * Method documentation is in IInsightFacade
 *
 */
export default class InsightFacade implements IInsightFacade {
	private datasetController: DatasetController;
	private queryFacade: QueryFacade;

	constructor() {
		this.datasetController = new DatasetController();
		this.queryFacade = new QueryFacade(this.datasetController);
		// register logger
		// comment this out to disable all logs
		Logging.registerConsoleLogger();
	}

	public addDataset(id: string, content: string, kind: InsightDatasetKind): Promise<string[]> {
		return this.datasetController.addDatasetHelper(id, content, kind);
	}

	public removeDataset(id: string): Promise<string> {
		return this.datasetController.removeDatasetHelper(id);
	}

	public performQuery(query: unknown): Promise<InsightResult[]> {
		return this.queryFacade.performQuery(query);
	}

	public listDatasets(): Promise<InsightDataset[]> {
		return this.datasetController.listDatasetHelper();
	}
}
