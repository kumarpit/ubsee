import {folderTest} from "@ubccpsc310/folder-test";
import {expect, use} from "chai";
import chaiAsPromised from "chai-as-promised";
import {
	IInsightFacade,
	InsightDatasetKind,
	InsightError,
	InsightResult,
	NotFoundError,
	ResultTooLargeError
} from "../../src/controller/IInsightFacade";
import InsightFacade from "../../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../TestUtils";

use(chaiAsPromised);

// before() is run once before all the tests in a describe
// after()   is run once after all the tests in a describe
// beforeEach() is run before each test in a describe
// afterEach()   is run after each test in a describe
describe("InsightFacade", async function () {
	let pairContent: string;
	let oneInvalidCourseContent: string;
	let emptyContent: string;
	let invalidContent: string;
	let mcompContent: string;
	let overallContent: string;
	let notZipContent: string;
	let emptyCoursesContent: string;
	let missingCourseContent: string;
	let missingFieldContent: string;
	let invalidSectionContent: string;
	let invalidStructureContent: string;
	let sectionOverallContent: string;
	let noValidSectionContent: string;
	let stringInAvgContent: string;
	let rejectContent: string;
	let nullProfContent: string;
	let emptyObjProfContent: string;
	let shouldntMatterContent: string;
	let roomsContent: string;

	before(function () {
		clearDisk();

		pairContent = getContentFromArchives("pair.zip");
		oneInvalidCourseContent = getContentFromArchives("1InvalidCourse.zip");
		emptyContent = getContentFromArchives("suchempty.zip");
		invalidContent = getContentFromArchives("invalid.zip");
		mcompContent = getContentFromArchives("dataset2.zip");
		overallContent = getContentFromArchives("dataset3.zip");
		notZipContent = getContentFromArchives("notzip/courses/ARST500");
		emptyCoursesContent = getContentFromArchives("emptyCourses.zip");
		missingCourseContent = getContentFromArchives("missingCourses.zip");
		missingFieldContent = getContentFromArchives("missingField.zip");
		invalidSectionContent = getContentFromArchives("invalidSection.zip");
		invalidStructureContent = getContentFromArchives("invalidStructure.zip");
		sectionOverallContent = getContentFromArchives("sectionOverall.zip");
		noValidSectionContent = getContentFromArchives("noValidSection.zip");
		stringInAvgContent = getContentFromArchives("stringInAvg.zip");
		rejectContent = getContentFromArchives("reject.zip");
		nullProfContent = getContentFromArchives("nullProf.zip");
		emptyObjProfContent = getContentFromArchives("emptyObjProf.zip");
		shouldntMatterContent = getContentFromArchives("shouldntMatter.zip");
		roomsContent = getContentFromArchives("rooms.zip");
	});

	describe("Dataset", function () {


		describe("Dataset Rooms and Sections", function(){
			let facade: IInsightFacade;

			before(function(){
				clearDisk();
				facade = new InsightFacade();
			});


			it("Should add both sections dataset and rooms dataset", async function(){
				await facade.addDataset("rooms", roomsContent, InsightDatasetKind.Rooms);
				let datasetIDs: string[] = await facade.addDataset("pair", pairContent, InsightDatasetKind.Sections);
				expect(datasetIDs.length).equal(2);
				expect(datasetIDs).deep.equal(["rooms", "pair"]);
			});

			it("Should be able to read the previously added datasets from another instance", async function(){
				let facade2 = new InsightFacade();
				let datasets =  await facade2.listDatasets();
				expect(datasets.length).equal(2);

				expect(datasets).deep.equal([
					{
						id: "pair",
						kind: "sections",
						numRows: 64612
					},
					{
						id: "rooms",
						kind: "rooms",
						numRows: 364
					}
				]);
			});

			// ROOMS QUERY SMOKE TEST
			it("Should run query on rooms dataset", async function() {
				let q = {
					WHERE: {
					  AND: [
							{
						  IS: {
									rooms_furniture: "*Tables*"
						  }
							},
							{
						  GT: {
									rooms_seats: 300
						  }
							}
					  ]
					},
					OPTIONS: {
					  COLUMNS: [
							"rooms_shortname",
							"maxSeats"
					  ],
					  ORDER: {
							dir: "DOWN",
							keys: [
						  "maxSeats"
							]
					  }
					},
					TRANSFORMATIONS: {
					  GROUP: [
							"rooms_shortname"
					  ],
					  APPLY: [
							{
						  maxSeats: {
									MAX: "rooms_seats"
						  }
							}
					  ]
					}
				  };

				await facade.performQuery(q)
					.then((res) => console.log(res))
					.catch((err) => console.log(err));
			});


		});

		describe("Dataset Rooms", function(){

			let facade: IInsightFacade;

			beforeEach(function(){
				clearDisk();
				facade = new InsightFacade();
			});

			// a valid room must contain all the query keys needed by a rooms query

			describe("Adding", function(){
				it("should reject an invalid zip file");
				it("should reject datasets with more than one index file");
				it("should reject an invalid building file not in the html format");
				it("should skip over a building html file without any rooms");
				it("should skip over a building if the geolocation results in an error");
				it("should only add datasets that contain atleast one valid room");
				it("should only add buildlings that are present in the inded file and skip over the rest");
			});

			describe("PARSE HTML TESTING", function(){

				it("Should do some html parsing", async function(){
					console.log("RUNNING HTML PARSING");
					let datasetIDs: string[] = await facade.addDataset("rooms",roomsContent, InsightDatasetKind.Rooms);
					expect(datasetIDs.length).equal(1);
					expect(datasetIDs).deep.equal(["rooms"]);
				});

			});

		});


		describe("Basic Dataset", function(){
			let facade: IInsightFacade;

			beforeEach(function(){
				clearDisk();
				facade = new InsightFacade();
			});

			it("Should add one new dataset and return its ID", function(){
				const addedId = facade.addDataset("courses", pairContent, InsightDatasetKind.Sections);
				return expect(addedId).eventually.to.deep.equal(["courses"]);
			});

			it("Should add multiple datasets and return the IDs of all datasets", async function(){
				const addedId1 = await facade.addDataset("course1", pairContent, InsightDatasetKind.Sections);
				const addedId2 = await facade.addDataset("course2", pairContent, InsightDatasetKind.Sections);
				return expect(addedId2).to.deep.equal(["course1","course2"]);
			});
		});

		describe("List Datasets", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("Should list no datasets when none have been added", async function () {
				const res = await facade.listDatasets();
				expect(res).to.deep.equal([]);
			});

			it("Should list one dataset after adding one dataset", async function() {
				await facade.addDataset("pair", pairContent, InsightDatasetKind.Sections);
				const res = await facade.listDatasets();

				expect(res).to.deep.equal([{
					id: "pair",
					kind: InsightDatasetKind.Sections,
					numRows: 64612
				}]);
			});

			it("Should list all datasets added so far", async function() {
				await facade.addDataset("dataset1", pairContent, InsightDatasetKind.Sections);
				await facade.addDataset("dataset2", pairContent, InsightDatasetKind.Sections);

				const res = await facade.listDatasets();
				const expected = [
					{
						id: "dataset1",
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					},
					{
						id: "dataset2",
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					}
				];

				expect(res).to.be.an.instanceOf(Array);
				expect(res).to.have.deep.members(expected);
				expect(res).to.have.length(2);
			});
		});


		describe("Add Dataset", function() {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("Should return IDs of all datsets added so far", async function() {
				const expected1 = ["dataset1"];
				const res1 = await facade.addDataset("dataset1", pairContent, InsightDatasetKind.Sections);

				expect(res1).to.be.an.instanceOf(Array);
				expect(res1).to.have.deep.members(expected1);
				expect(res1).to.have.length(1);

				const expected2 = ["dataset1", "dataset2"];
				const res2 = await facade.addDataset("dataset2", pairContent, InsightDatasetKind.Sections);

				expect(res2).to.be.an.instanceOf(Array);
				expect(res2).to.have.deep.members(expected2);
				expect(res2).to.have.length(2);
			});

			it("Should reject an invalid dataset (random string)", function() {
				const res = facade.addDataset("invalid-content", "abcdef", InsightDatasetKind.Sections);

				return expect(res).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should reject dataset ID with underscores", async function() {
				const future = facade.addDataset("invalid_id", pairContent, InsightDatasetKind.Sections);

				return expect(future).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should reject dataset ID with 'only' whitespaces", async function() {
				const future = facade.addDataset("  ", pairContent, InsightDatasetKind.Sections);

				return expect(future).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should reject datasets if dataset with same ID has been added before", async function() {
				await facade.addDataset("dataset", pairContent, InsightDatasetKind.Sections);
				const res = facade.addDataset("dataset", pairContent, InsightDatasetKind.Sections);

				return expect(res).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should skip over an invalid course file (invalid JSON)", async function() {
				try {
					await facade.addDataset("dataset1", oneInvalidCourseContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept"
							]
						}
					});

					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(2);
				} catch (err) {
					expect.fail();
				}
			});

			it("Should reject empty dataset", async function() {
				const res = facade.addDataset("empty", emptyContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should accept dataset ID with whitespace (not ONLY whitespace)", async function () {
				const res = await facade.addDataset("white space", pairContent, InsightDatasetKind.Sections);
				const expected = ["white space"];
				expect(res).to.have.length(1);
				expect(res).to.deep.equal(expected);
			});

			it("Should reject dataset with no valid course sections", async function() {
				const res = facade.addDataset("invalid", invalidContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected
					.and.be.an.instanceOf(InsightError);
			});

			it("Should reject with NotFoundError if key not yet added", function() {
				const res = facade.removeDataset("dne");

				return expect(res).to.eventually.be.rejected
					.and.be.an.instanceOf(NotFoundError);
			});

			it("Should reject invalid zip file", function () {
				const res = facade.addDataset("notzip", notZipContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should reject on empty courses folder", function () {
				const res = facade.addDataset("emptyCourses", emptyCoursesContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should reject on missing courses folder", function () {
				const res = facade.addDataset("missingCourses", missingCourseContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should reject section with missing field (Course title)", async function () {

				try {
					await facade.addDataset("dataset1", missingFieldContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept",
								"dataset1_avg",
								"dataset1_pass",
								"dataset1_uuid"
							]
						}
					});

					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
				} catch (err) {
					expect.fail();
				}

			});

			it("Should reject invalid section (Invalid JSON)", async function () {

				try {
					await facade.addDataset("dataset1", invalidSectionContent, InsightDatasetKind.Sections);

					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept",
								"dataset1_avg",
								"dataset1_pass",
								"dataset1_uuid"
							]
						}
					});

					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
				} catch (err) {
					expect.fail();
				}

			});

			it("Should reject if dataset field is set to 'results' instead of 'result'", function () {
				let res = facade.addDataset("invalid", invalidStructureContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should reject empty string as dataset ID", function () {
				let res = facade.addDataset("", pairContent, InsightDatasetKind.Sections);
				return expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should set year to 1900 if section is OVERALL", async function () {
				try {
					await facade.addDataset("dataset1", sectionOverallContent, InsightDatasetKind.Sections);

					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept",
								"dataset1_avg",
								"dataset1_year",
							]
						}
					});

					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
					expect((res[0])["dataset1_year"]).to.be.equal(1900);
				} catch (err) {
					expect.fail();
				}

			});

			it("Should reject dataset with no valid section", function () {
				let res = facade.addDataset("noneValid", noValidSectionContent, InsightDatasetKind.Sections);
				expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			// add more positive cases, negative ones not catching anything
			// data types - map each field to valid data type, irrespective of what is is typed as in the dataset json
			// what happens if math field in dataset a string than cannot be parsed into a number
			it("Should reject dataset if NaN in number field", async function () {
				try {
					await facade.addDataset("pls", stringInAvgContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"pls_dept",
								"pls_avg",
								"pls_year",
							]
						}
					});
					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
				} catch (err) {
					expect.fail();
				}
			});

			it("Should reject invalid sections - another one", async function () {
				try {
					await facade.addDataset("reject", rejectContent, InsightDatasetKind.Sections);
					expect.fail();
				} catch (err) {
					expect(err).to.be.an.instanceOf(InsightError);
				}
			});

			it("Shuold reject if null in JSON", async function () {
				try {
					await facade.addDataset("pls", nullProfContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"pls_dept",
								"pls_avg",
								"pls_year",
							]
						}
					});
					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
				} catch (err) {
					expect.fail();
				}
			});

			it("Shuold reject if empty object in JSON", async function () {
				try {
					await facade.addDataset("pls", emptyObjProfContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"pls_dept",
								"pls_avg",
								"pls_instructor",
							]
						}
					});
					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);
				} catch (err) {
					expect.fail();
				}
			});

			it("Shuold not reject if keys other than SECTION_KEYS are neither string or number", async function () {
				try {
					await facade.addDataset("pls", shouldntMatterContent, InsightDatasetKind.Sections);
					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"pls_dept",
								"pls_avg",
								"pls_instructor",
							]
						}
					});
					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(2);
				} catch (err) {
					expect.fail();
				}
			});

		});

		describe("Delete Dataset", function () {
			let facade: IInsightFacade;

			beforeEach(function () {
				clearDisk();
				facade = new InsightFacade();
			});

			it("Should delete dataset", async function() {
				try {
					await facade.addDataset("dataset", pairContent, InsightDatasetKind.Sections);
					await facade.removeDataset("dataset");
					const res1 = await facade.listDatasets();

					expect(res1).to.deep.equal([]);

					await facade.addDataset("dataset1", pairContent, InsightDatasetKind.Sections);
					await facade.addDataset("dataset2", pairContent, InsightDatasetKind.Sections);
					await facade.removeDataset("dataset1");
					const res2 = await facade.listDatasets();

					const expected = [{
						id: "dataset2",
						kind: InsightDatasetKind.Sections,
						numRows: 64612
					}];

					expect(res2).to.be.an.instanceOf(Array);
					expect(res2).to.have.deep.members(expected);
					expect(res2).to.have.length(1);
				} catch (err) {
					expect.fail();
				}
			});

			it("Should reject with NotFound error if key not yet added", function () {
				let res = facade.removeDataset("notyet");
				return expect(res).to.eventually.to.be.rejected.and.be.an.instanceOf(NotFoundError);
			});

			it("Should reject with InsightError if invalid key is entered", function () {
				let res = facade.removeDataset("  ");
				return expect(res).to.eventually.be.rejected.and.be.an.instanceOf(InsightError);
			});

			it("Should fail subsequent queries on deleted dataset", async function () {
				try {
					await facade.addDataset("dataset1", missingFieldContent, InsightDatasetKind.Sections);

					let res = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept",
								"dataset1_avg",
								"dataset1_pass",
								"dataset1_uuid"
							]
						}
					});

					expect(res).to.be.an.instanceOf(Array);
					expect(res).to.have.length(1);

					await facade.removeDataset("dataset1");

					let res2 = await facade.performQuery({
						WHERE: {},
						OPTIONS: {
							COLUMNS: [
								"dataset1_dept",
								"dataset1_avg",
								"dataset1_pass",
								"dataset1_uuid"
							]
						}
					});

					expect.fail();
				} catch (err) {
					expect(err).to.be.an.instanceOf(InsightError);
				}

			});

		});
	});

	// ------------------------------------------------------------------------------------------------------------------------


	describe("Query Engine", function() {
        type FtInput = unknown;
        type FtOutput = Promise<InsightResult[]>;
        type FtError = any;
        let facadeQE: InsightFacade;

        before(async function () {
        	clearDisk();
        	facadeQE = new InsightFacade();

        	try {
        		await facadeQE.addDataset("sections", pairContent, InsightDatasetKind.Sections);
        		await facadeQE.addDataset("courses", pairContent, InsightDatasetKind.Sections);
        		await facadeQE.addDataset("cpsc313", mcompContent, InsightDatasetKind.Sections);
        		await facadeQE.addDataset("overall", overallContent, InsightDatasetKind.Sections);
        	} catch (err) {
        		// console.log(err);
        	}

        });

        it("math should work", async function() {
        	const res1 = await facadeQE.performQuery({
        		WHERE: {
        			GT: {
        				cpsc313_avg: 50
        			}
        		},
        		OPTIONS: {
        			COLUMNS: [
        				"cpsc313_avg"
        			]
        		}
        	});

        	const expected1 = [
        		{cpsc313_avg: 94}
        	];

        	expect(res1).to.be.an.instanceOf(Array);
        	expect(res1).to.have.deep.members(expected1);
        	expect(res1).to.have.length(1);

        	const res2 = await facadeQE.performQuery({
        		WHERE: {
        			LT: {
        				cpsc313_avg: 50
        			}
        		},
        		OPTIONS: {
        			COLUMNS: [
        				"cpsc313_dept",
        				"cpsc313_title"
        			]
        		}
        	});

        	const expected2 = [
        		{
        			cpsc313_dept: "cpsc",
        			cpsc313_title: "info tech&archvs"
        		}
        	];

        	expect(res2).to.be.an.instanceOf(Array);
        	expect(res2).to.have.deep.members(expected2);
        	expect(res2).to.have.length(1);

        	const res3 = await facadeQE.performQuery({
        		WHERE: {
        			EQ: {
        				cpsc313_avg: 50
        			}
        		},
        		OPTIONS: {
        			COLUMNS: [
        				"cpsc313_dept",
        				"cpsc313_title"
        			]
        		}
        	});

        	expect(res3).to.be.deep.equal([]);
        });

        it("should set year to 1900 if section is OVERALL", async function() {
        	const res = await facadeQE.performQuery({
        		WHERE: {},
        		OPTIONS: {
        			COLUMNS: [
        				"overall_year"
        			],
        			ORDER: "overall_year"
        		}
        	});

        	const expected = [{overall_year: 1900}];

        	expect(res).to.be.instanceOf(Array);
        	expect(res).to.have.deep.members(expected);
        	expect(res).to.have.length(1);
        });

        it("Should query multiple datasets without issues", async function () {
        	const res = await facadeQE.performQuery({
        		WHERE: {},
        		OPTIONS: {
        			COLUMNS: [
        				"overall_year"
        			],
        			ORDER: "overall_year"
        		}
        	});

        	const expected = [{overall_year: 1900}];

        	expect(res).to.be.instanceOf(Array);
        	expect(res).to.have.deep.members(expected);
        	expect(res).to.have.length(1);

        	const res3 = await facadeQE.performQuery({
        		WHERE: {
        			EQ: {
        				cpsc313_avg: 50
        			}
        		},
        		OPTIONS: {
        			COLUMNS: [
        				"cpsc313_dept",
        				"cpsc313_title"
        			]
        		}
        	});

        	expect(res3).to.be.deep.equal([]);
        });

		// c1 query tests
        folderTest<FtInput, FtOutput, FtError>(
        	"C1 query tests",
        	(input: FtInput): FtOutput => facadeQE.performQuery(input),
        	"./test/resources/json-spec/c1",
        	{
        		assertOnResult: (actual, expected, _) => {
        			console.log(actual);
        			expect(actual).to.deep.equal(expected);
        		},

        		assertOnError: (actual, expected, _) => {
        			if (expected === "InsightError") {
        				console.log(actual);
        				expect(actual).to.be.an.instanceOf(InsightError);
        			} else if (expected === "ResultTooLargeError") {
        				expect(actual).to.be.an.instanceOf(ResultTooLargeError);
        			} else {
        				expect.fail();
        			}
        		},
        	}
        );

		// c2 query tests
        folderTest<FtInput, FtOutput, FtError>(
        	"C2 query tests",
        	(input: FtInput): FtOutput => facadeQE.performQuery(input),
        	"./test/resources/json-spec/temp",
        	{
        		assertOnResult: (actual, expected, _) => {
        			expect(actual).to.deep.equal(expected);
        		},

        		assertOnError: (actual, expected, _) => {
        			if (expected === "InsightError") {
        				expect(actual).to.be.an.instanceOf(InsightError);
        			} else if (expected === "ResultTooLargeError") {
        				expect(actual).to.be.an.instanceOf(ResultTooLargeError);
        			} else {
        				expect.fail();
        			}
        		},
        	}
        );
	});
});
