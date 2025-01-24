import express, {Application, Request, Response} from "express";
import * as http from "http";
import cors from "cors";
import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	NotFoundError,
	ResultTooLargeError,
	isInsightDatasetKind
} from "../controller/IInsightFacade";
import InsightFacade from "../controller/InsightFacade";
import {getContentFromArchives} from "../../test/TestUtils";

export default class Server {
	private readonly port: number;
	private express: Application;
	private server: http.Server | undefined;
	private static insightFacade: IInsightFacade;

	constructor(port: number) {
		console.info(`Server::<init>( ${port} )`);
		this.port = port;
		this.express = express();

		this.registerMiddleware();
		this.registerRoutes();

		// NOTE: you can serve static frontend files in from your express server
		// by uncommenting the line below. This makes files in ./frontend/public
		// accessible at http://localhost:<port>/
		// this.express.use(express.static("./frontend/public"))
	}

	/**
	 * Starts the server. Returns a promise that resolves if success. Promises are used
	 * here because starting the server takes some time and we want to know when it
	 * is done (and if it worked).
	 *
	 * @returns {Promise<void>}
	 */
	public start(): Promise<void> {
		return new Promise((resolve, reject) => {
			console.info("Server::start() - start");
			if (this.server !== undefined) {
				console.error("Server::start() - server already listening");
				reject();
			} else {
				this.server = this.express.listen(this.port, async () => {
					console.info(`Server::start() - server listening on port: ${this.port}`);
					await this.insightFacadeInit();
					resolve();
				}).on("error", (err: Error) => {
					// catches errors in server start
					console.error(`Server::start() - server ERROR: ${err.message}`);
					reject(err);
				});
			}
		});
	}

	/**
	 * Stops the server. Again returns a promise so we know when the connections have
	 * actually been fully closed and the port has been released.
	 *
	 * @returns {Promise<void>}
	 */
	public stop(): Promise<void> {
		console.info("Server::stop()");
		return new Promise((resolve, reject) => {
			if (this.server === undefined) {
				console.error("Server::stop() - ERROR: server not started");
				reject();
			} else {
				this.server.close(() => {
					console.info("Server::stop() - server closed");
					resolve();
				});
			}
		});
	}

	// Registers middleware to parse request before passing them to request handlers
	private registerMiddleware() {
		// JSON parser must be place before raw parser because of wildcard matching done by raw parser below
		this.express.use(express.json());
		this.express.use(express.raw({type: "application/*", limit: "10mb"}));

		// enable cors in request headers to allow cross-origin HTTP requests
		this.express.use(cors());
	}

	// Registers all request handlers to routes
	private registerRoutes() {
		// This is an example endpoint this you can invoke by accessing this URL in your browser:
		// http://localhost:4321/echo/hello
		this.express.get("/echo/:msg", Server.echo);
		this.express.get("/datasets", Server.getDataset);
		this.express.put("/dataset/:id/:kind", Server.putDataset);
		this.express.delete("/dataset/:id", Server.deleteDataset);
		this.express.post("/query", Server.postQuery);
	}

	private static async getDataset(req: Request, res: Response){
		try{
			console.log("Requesting datasets...");
			const response = await Server.insightFacade.listDatasets();
			console.log("Datasets have been provided");
			res.status(200).json({result: response});
		}catch(err){
			if(err instanceof InsightError){
				res.status(400).json({error: err.message});
			}
		}
	}

	private static async putDataset(req: Request, res: Response){
		try{
			const kind = req.params.kind;
			if(!isInsightDatasetKind(kind)) {
				throw Error("The kind of the dataset is not correct");
			}
			const id = req.params.id;
			const content: string = req.body; // get the content from the body and convert it to base64
			console.log(req);
			const buff = Buffer.from(content);
			const contentBase64 = buff.toString("base64");
			console.log("Attempting to add dataset...");
			const response = await Server.insightFacade.addDataset(id, contentBase64, kind as InsightDatasetKind);
			console.log("Dataset has been added");
			res.status(200).json({result: response});
		}catch(err){
			console.log("Error in adding a dataset: \n" + err);
			if(err instanceof InsightError){
				res.status(400).json({error: err.message});
			}
		}
	}

	private static async postQuery(req: Request, res: Response){
		try{
			console.log("Posting query...");
			const query = req.body;
			console.log(JSON.stringify(query));
			const response = await Server.insightFacade.performQuery(query);
			console.log("Query has been responded to");
			res.status(200).json({result: response});
		}catch(err){
			if(err instanceof InsightError || err instanceof ResultTooLargeError){
				res.status(400).json({error: err.message});
			}
		}
	}

	private static async deleteDataset(req: Request, res: Response){
		try{
			const id = req.params.id;
			console.log(`Deleting dataset with id: ${id} if it exists...`);
			const response = await Server.insightFacade.removeDataset(id);
			console.log("Dataset has been deleted");
			res.status(200).json({result: response});
		}catch(err){
			console.log("Error in deleting dataset: ");
			if(err instanceof InsightError){
				res.status(400).json({error: err.message});
				console.log(err);
			}else if(err instanceof NotFoundError){
				res.status(404).json({error: err.message});
				console.log("The dataset does not exist");
			}
		}
	}

	private async insightFacadeInit(){
		Server.insightFacade = new InsightFacade();
		let roomsContent: string = getContentFromArchives("rooms.zip");
		let sectionsContent: string  = getContentFromArchives("pair.zip");
		try{
			await Server.insightFacade.addDataset("sections", sectionsContent, InsightDatasetKind.Sections);
		}catch(err){
			// skip if the dataset already exists
		}
		try{
			await Server.insightFacade.addDataset("rooms", roomsContent, InsightDatasetKind.Rooms);
		}catch(err){
			// skip if the dataset already exists
		}

	}

	// The next two methods handle the echo service.
	// These are almost certainly not the best place to put these, but are here for your reference.
	// By updating the Server.echo function pointer above, these methods can be easily moved.
	private static echo(req: Request, res: Response) {
		try {
			console.log(`Server::echo(..) - params: ${JSON.stringify(req.params)}`);
			const response = Server.performEcho(req.params.msg);
			res.status(200).json({result: response});
		} catch (err) {
			res.status(400).json({error: err});
		}
	}

	private static performEcho(msg: string): string {
		if (typeof msg !== "undefined" && msg !== null) {
			return `${msg}...${msg}`;
		} else {
			return "Message not provided";
		}
	}
}
