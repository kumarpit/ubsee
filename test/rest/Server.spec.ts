import Server from "../../src/rest/Server";
import InsightFacade from "../../src/controller/InsightFacade";
import chai, {expect, use} from "chai";

import chaiHttp from "chai-http";
import * as fs from "fs-extra";

describe("Server", function () {

	let facade: InsightFacade;
	let server: Server;
	let SERVER_URL = "http://localhost:4321/";


	use(chaiHttp);

	before(function () {
		facade = new InsightFacade();
		server = new Server(4321);
		// TODO: start server here once and handle errors properly
	});

	after(function () {
		// TODO: stop server here once!
	});

	beforeEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	afterEach(function () {
		// might want to add some process logging here to keep track of what"s going on
	});

	describe("Testing PUT to add new datasets", () => {
		it("PUT test for courses dataset", function () {
			let ENDPOINT_URL = "dataset/courses/sections";
			let name = "pair.zip";
			let ZIP_FILE_DATA = fs.readFileSync(`test/resources/archives/${name}`);
			try {
				return chai.request(SERVER_URL)
					.put(ENDPOINT_URL)
					.send(ZIP_FILE_DATA)
					.set("Content-Type", "application/x-zip-compressed")
					.then(function (res: ChaiHttp.Response) {
						console.log(res);
						expect(res.status).to.be.equal(200);
					})
					.catch(function (err) {
						console.log(err);
						expect.fail();
					});
			} catch (err) {
				console.log(err);
			}
		});
	});

	// Sample on how to format PUT requests
	/*
	it("PUT test for courses dataset", function () {
		try {
			return chai.request(SERVER_URL)
				.put(ENDPOINT_URL)
				.send(ZIP_FILE_DATA)
				.set("Content-Type", "application/x-zip-compressed")
				.then(function (res: ChaiHttp.Response) {
					// some logging here please!
					expect(res.status).to.be.equal(200);
				})
				.catch(function (err) {
					// some logging here please!
					expect.fail();
				});
		} catch (err) {
			// and some more logging here!
		}
	});
	*/

	// The other endpoints work similarly. You should be able to find all instructions at the chai-http documentation
});
