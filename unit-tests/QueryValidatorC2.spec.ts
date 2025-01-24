import { InsightError } from "../src/controller/IInsightFacade";
import QueryParser from "../src/helpers/Query/QueryParser";
import { expect } from "chai";
import { Logging } from "../src/utils/logger/LogManager";
import { printTree } from "../src/utils/Utils";

Logging.registerConsoleLogger();
const log = Logging.getLogger();

describe("Query Controller", function () {
    let qc: QueryParser = new QueryParser();

    describe("C2 Queries", function () {

        it("Should accept simple valid query", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title", "overallAvg"]

                },

                "TRANSFORMATIONS": {

                    "GROUP": ["sections_title"],

                    "APPLY": [{

                        "overallAvg": {

                            "AVG": "sections_avg"

                        }

                    }]

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.true;
            expect(qc.error).to.be.null;
        });

        it("Should accept simple valid query", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title", "overallAvg"],
                    "ORDER": {
                        "dir": "UP",
                        "keys": ["overallAvg"]
                    }

                },

                "TRANSFORMATIONS": {

                    "GROUP": ["sections_title"],

                    "APPLY": [{

                        "overallAvg": {

                            "AVG": "sections_avg"

                        }

                    }]

                }

            }
            let res = qc.isValidQuery(q);
            log.debug(qc.error)
            expect(res).to.be.true;
            expect(qc.error).to.be.null;
        });

        it("Should reject order key not in columns", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title", "overallAvg"],
                    "ORDER": {
                        "dir": "UP",
                        "keys": ["overallAvg", "maxAvg"]
                    }

                },

                "TRANSFORMATIONS": {

                    "GROUP": ["sections_title"],

                    "APPLY": [{

                        "overallAvg": {

                            "AVG": "sections_avg"

                        }

                    }]

                }

            }
            let res = qc.isValidQuery(q);
            log.debug(qc.error)
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });


        it("Should reject non-array group", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title", "sections_avg"]

                },

                "TRANSFORMATIONS": {

                    "GROUP": { "sections_title": 2 }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });



        it("Should accept order with sort object", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "dir": "UP",
                        "keys": ["sections_title"]
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.true;
            expect(qc.error).to.be.null;
        });

        it("Should reject order with invalid dir", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "dir": "up",
                        "keys": ["sections_title"]
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject order with order key not in columns", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "dir": "UP",
                        "keys": ["sections_title, sections_avg"]
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject order with missing field", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "dir": "UP"
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject order with missing field", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "keys": ["sections_title"]
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject order with non-array keys", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": {
                        "dir": "UP",
                        "keys": {}
                    }

                }

            }
            let res = qc.isValidQuery(q);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject null order", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title"],
                    "ORDER": null

                }

            }
            let res = qc.isValidQuery(q);
            log.debug(qc.error);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        it("Should reject if column has key not in transformations", function () {
            let q = {

                "WHERE": {},

                "OPTIONS": {

                    "COLUMNS": ["sections_title", "overallAvg", "sections_avg"]

                },

                "TRANSFORMATIONS": {

                    "GROUP": ["sections_title"],

                    "APPLY": [{

                        "overallAvg": {

                            "AVG": "sections_avg"

                        }

                    }]

                }

            }
            let res = qc.isValidQuery(q);
            log.debug(qc.error);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        // --------------------------------------------------------------------------------------------------------------

        // room queries
        it("Should parse as simple rooms query", function () {
            let q = {   

                "WHERE": {       
               
                    "AND": [{           
               
                       "IS": {               
               
                           "rooms_furniture": "*Tables*"           
               
                        }       
               
                    }, {           
               
                        "GT": {               
               
                          "rooms_seats": 300           
               
                         }       
               
                   }]   
               
                 },   
               
                 "OPTIONS": {       
               
                     "COLUMNS": [           
               
                         "rooms_shortname",           
               
                         "maxSeats"       
               
                     ],       
               
                 "ORDER": {           
               
                    "dir": "DOWN",           
               
                    "keys": ["maxSeats"]       
               
                 }   
               
                 },   
               
                 "TRANSFORMATIONS": {       
               
                     "GROUP": ["rooms_shortname"],       
               
                     "APPLY": [{           
               
                         "maxSeats": {               
               
                             "MAX": "rooms_seats"           
               
                          }       
               
                     }]   
               
                 }
               
               }
            let res = qc.isValidQuery(q);
            log.debug(qc.error);
            // printTree(qc.query);
            expect(res).to.be.true;
        });

        it("Should reject if rooms has section fields", function () {
            let q = {   

                "WHERE": {       
               
                    "AND": [{           
               
                       "IS": {               
               
                           "rooms_furniture": "*Tables*"           
               
                        }       
               
                    }, {           
               
                        "GT": {               
               
                          "rooms_avg": 300           
               
                         }       
               
                   }]   
               
                 },   
               
                 "OPTIONS": {       
               
                     "COLUMNS": [           
               
                         "rooms_shortname",           
               
                         "maxSeats"       
               
                     ],       
               
                 "ORDER": {           
               
                    "dir": "DOWN",           
               
                    "keys": ["maxSeats"]       
               
                 }   
               
                 },   
               
                 "TRANSFORMATIONS": {       
               
                     "GROUP": ["rooms_shortname"],       
               
                     "APPLY": [{           
               
                         "maxSeats": {               
               
                             "MAX": "rooms_seats"           
               
                          }       
               
                     }]   
               
                 }
               
               }
            let res = qc.isValidQuery(q);
            log.debug(qc.error);
            expect(res).to.be.false;
            expect(qc.error).to.be.an.instanceOf(InsightError);
        });

        
    })
})
