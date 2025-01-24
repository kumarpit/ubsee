// import {expect} from "chai";
// import {InsightError} from "../src/controller/IInsightFacade";
// import {parseWhere} from "../src/helpers/parseUtils";
// import {InsightQueryNode} from "../src/types/Query";

// describe("Query Parser", function() {
// 	let print = false;
// 	it("should parse valid scomparison", function () {
// 		let where = {
// 			IS: {
// 				sections_dept: "test"
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("should parse valid mcomparison", function () {
// 		let where = {
// 			LT: {
// 				sections_avg: 80
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("should parse simple AND query", function () {
// 		let where = {
// 			AND: [
// 				{
// 					LT: {
// 						sections_avg: 80
// 					}
// 				},
// 				{
// 					IS: {
// 						sections_dept: "test"
// 					}
// 				}
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("should parse nested AND query", function () {
// 		let where = {
// 			AND: [
// 				{
// 					LT: {
// 						sections_avg: 80
// 					}
// 				},
// 				{
// 					AND: [
// 						{
// 							GT: {
// 								sections_pass: 100
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: "cpsc"
// 							}
// 						}
// 					]
// 				}
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("should parse complex query", function () {
// 		let where = {
// 			OR:[
// 				{
// 					AND:[
// 						{
// 							GT:{
// 								sections_avg:90
// 							}
// 						},
// 						{
// 							IS:{
// 								sections_dept:"adhe"
// 							}
// 						}
// 					]
// 				},
// 				{
// 					EQ:{
// 						sections_avg:95
// 					}
// 				}

// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("Should parse NOT query", function () {
// 		let where = {
// 			NOT: {
// 				GT: {
// 					sections_avg: 97
// 				}
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it("Should reject empty filter in AND", function () {
// 		let where = {
// 			OR:[
// 				{
// 					AND:[
// 						{},
// 						{
// 							IS:{
// 								sections_dept:"adhe"
// 							}
// 						}
// 					]
// 				},
// 				{
// 					EQ:{
// 						sections_avg:95
// 					}
// 				}

// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it("Should reject excess keys in WHERE", function () {
// 		let where = {
// 			OR:[
// 				{
// 					AND:[
// 						{},
// 						{
// 							IS:{
// 								sections_dept:"adhe"
// 							}
// 						}
// 					]
// 				},
// 				{
// 					EQ:{
// 						sections_avg:95
// 					}
// 				}

// 			],
// 			IS: {
// 				sections_dept: "cpsc"
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("Should reject on string value in mcomp field", function () {
// 		let where = {
// 			AND: [
// 				{
// 					LT: {
// 						sections_avg: "80"
// 					}
// 				},
// 				{
// 					AND: [
// 						{
// 							GT: {
// 								sections_pass: 100
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: "cpsc"
// 							}
// 						}
// 					]
// 				}
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("Should reject on number value in scomp field", function () {
// 		let where = {
// 			AND: [
// 				{
// 					LT: {
// 						sections_avg: 80
// 					}
// 				},
// 				{
// 					AND: [
// 						{
// 							GT: {
// 								sections_pass: 100
// 							}
// 						},
// 						{
// 							IS: {
// 								sections_dept: 90
// 							}
// 						}
// 					]
// 				}
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("Should parse empty WHERE", function () {
// 		let where = {};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightQueryNode);
// 	});

// 	it ("Should reject empty logic queries",  function () {
// 		let where = {
// 			OR:[
// 				{
// 					AND:[

// 					]
// 				},
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject asterix in the middle of search string",  function () {
// 		let where = {
// 			AND: [
// 				{
// 					LT: {
// 						sections_avg: 80
// 					}
// 				},
// 				{
// 					IS: {
// 						sections_dept: "****"
// 					}
// 				}
// 			]
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject on invalid dataset keys - multiple underscores", function () {
// 		let where = {
// 			LT: {
// 				sections__avg: 90
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject invalid comparator", function () {
// 		let where = {
// 			IZ: {
// 				sections_dept: "cpsc"
// 			}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject empty NOT", function () {
// 		let where = {
// 			NOT: {}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("shoudl reject NOT array", function () {
// 		let where = {
// 			NOT: []
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject AND object", function () {
// 		let where = {
// 			AND: {}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		if (print) {
// 			console.log(actual);
// 		}
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});

// 	it ("should reject OR object", function () {
// 		let where = {
// 			OR: {}
// 		};

// 		let actual = parseWhere(where, "sections");
// 		expect(actual).to.be.instanceOf(InsightError);
// 	});
// });
