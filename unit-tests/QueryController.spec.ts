import {InsightDatasetKind} from "../src/controller/IInsightFacade";
import InsightFacade from "../src/controller/InsightFacade";
import {clearDisk, getContentFromArchives} from "../test/TestUtils";

// describe("console query", function () {
// 	clearDisk();
// 	let insightFacade = new InsightFacade();
// 	let content;

// 	before (async function () {
// 		clearDisk();
// 		content = getContentFromArchives("2Datasets.zip");
// 		await insightFacade.addDataset("sections", content, InsightDatasetKind.Sections);
// 	});

// 	it ("test perform query, console logs output",  function () {

// 		let query = {
			// WHERE: {
			// 	NOT: {
			// 		AND: [
			// 			{
			// 				IS: {
			// 					sections_dept: "cpsc"
			// 				}
			// 			},
			// 			{
			// 				GT: {
			// 					sections_avg: 90
			// 				}
			// 			}
			// 		]
			// 	}
			// },
			// OPTIONS: {
			// 	COLUMNS: ["sections_dept",
			// 		"sections_avg", "sections_pass", "sections_uuid", "sections_title", "sections_instructor"],
			// 	ORDER: "sections_instructor"
			// }
// 		};

// 		insightFacade.performQuery(query)
// 			.then((res) => console.log(res))
// 			.catch((err) => console.log(err));
// 	});
// });
