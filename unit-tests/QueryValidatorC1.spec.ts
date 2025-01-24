import {InsightError} from "../src/controller/IInsightFacade";
import QueryParser from "../src/helpers/Query/QueryParser";
import {expect} from "chai";

describe("Query Controller", function() {
	let qc: QueryParser = new QueryParser();

	describe("First-level validation", function () {

		it("Should accept valid query", function() {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_dept"
				}
			};
			expect(qc.isValidQuery(q)).to.be.true;
			expect(qc.error).to.be.null;
		});

		it("Should reject on null query", function() {
			let q = null;
			expect(qc.isValidQuery(q)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);
		});

		it("Should reject on non-object query", function () {
			let q = 2;
			expect(qc.isValidQuery(q)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);
		});

		it("Should reject on missing WHERE", function() {
			let q1 = {
				OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q1)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);

			let q2 = {
				where: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q1)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);
		});

		it("Should reject on missing OPTIONS", function() {
			let q1 = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}
			};
			expect(qc.isValidQuery(q1)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);

			let q2 = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, options: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q2)).to.be.false;
			expect(qc.error).to.be.an.instanceOf(InsightError);
		});

		it("Should reject when WHERE or OPTIONS have non-object values", function() {
			let q1 = {
				WHERE: 2
			};

			let q2 = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: 2
			};
			expect(qc.isValidQuery(q1)).to.be.false;
			expect(qc.isValidQuery(q2)).to.be.false;
		});

		it("Should reject on excess keys", function() {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_avg"
				},
				EXCESS: 2
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});
	});

	describe("Validating OPTIONS", function () {

		it("Should reject on missing COLUMNS", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});

		it("Should reject on empty COLUMNS array", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: [],
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});

		it("Should reject on excess keys", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: [],
					ORDER: "sections_avg"
				}, EXCESS: 2
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});

		it("Should reject on multiple dataset ids", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "section_avg"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;

			let qq = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sectio_dept", "sect_id"],
					ORDER: "section_avg"
				}
			};
			expect(qc.isValidQuery(qq)).to.be.false;
		});

		it("Should reject on invalid dataset fields", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_deptt"],
					ORDER: "section_avg"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;

			let qq = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sectio_dept", "sect_id"],
					ORDER: "section_avvg"
				}
			};
			expect(qc.isValidQuery(qq)).to.be.false;
		});

		it("Should reject if ORDER not in COLUMNS", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept"],
					ORDER: "sections_avg"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});

		it("Should accept duplicate keys in COLUMNS", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections_dept", "section_dept"],
					ORDER: "section_dept"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});

		it("Should reject multiple underscores in query keys", function () {
			let q = {
				WHERE: {
					GT: {
						sections_avg: 80
					}
				}, OPTIONS: {
					COLUMNS: ["sections__dept", "section_dept"],
					ORDER: "section_dept"
				}
			};
			expect(qc.isValidQuery(q)).to.be.false;
		});
	});

});
