import * as http from "http";
import JSZip from "jszip";
import {InsightDatasetKind, InsightError} from "../controller/IInsightFacade";
import {InsightQueryNode} from "../helpers/Query/InsightQueryNode";
import {isMField} from "../helpers/Query/validateUtils";
import {GEO_API_URL, Nullable} from "../types/Constants";
import {CourseSection} from "../types/CourseSection";
import {
	CourseSectionModelAPI, isSectionMKey,
	isSectionSKey, SectionKeys, UnknownCourseSectionModelAPI
} from "../types/CourseSectionModel";
import {GeoResponse} from "../types/GeoResponse";
import {Primer, QueryKey, SortFunction, ValidField} from "../types/Query";
import {Result} from "../types/Result";
import {Logging} from "./logger/LogManager";

// general utility functions

Logging.registerConsoleLogger();
let log = Logging.getLogger();

const sectionsRequiredProperties: string[] = ["Avg", "Pass", "Fail", "Audit", "Year",
	"id", "Professor", "Title", "Subject", "Course"];
const roomsRequiredProperties: string[] = [];

function checkHasProperties(obj: object, kind: InsightDatasetKind): boolean {
	let requiredProperties: string[] = [];
	if(kind === InsightDatasetKind.Rooms){
		requiredProperties = roomsRequiredProperties;
	}else{
		requiredProperties = sectionsRequiredProperties;
	}
	for(let property of requiredProperties){
		if(!Object.prototype.hasOwnProperty.call(obj, property)) {
			return false;
		}
	}
	return true;
}

function isValidDataset(zip: JSZip, kind: InsightDatasetKind): boolean{

	let folderCheck: string;
	let errorText = "";
	if(kind === InsightDatasetKind.Rooms){
		folderCheck = "campus/discover/buildings-and-classrooms";
		if(zip.file("index.htm") === null){
			return false;
		}
	}else{
		folderCheck = "courses";
	}

	if(zip.folder(folderCheck) === null){
		errorText += `Invalid dataset! No ${folderCheck} folder`;
		return false;
	}

	// if(zip.folder(/courses/) === null)

	// check if the folder has any files at all
	if(Object.keys(zip.files).length === 0){
		errorText += `Invalid dataset! No files inside the ${folderCheck} folder`;
		return false;
	}

	return true;
}

function isValidDatasetID(datasetID: string): boolean{
	// check if the datasetID contains whitespaces or underscores
	let whitespaceCheck = countOccurences(datasetID,(new RegExp(" ","g"))) === datasetID.length;
	let underscoreCheck = datasetID.includes("_");
	let nullCheck = datasetID === "";

	if ( whitespaceCheck || underscoreCheck || nullCheck){
		return false;
	}
	return true;
}


// section guranteed is JSON and has valid properties.
function courseSectionMapper (section: UnknownCourseSectionModelAPI): Nullable<CourseSection> {
	// confirm that that all string values are string
	// and all math values are numbers
	for (let key of Object.keys(section)) {
		let notString = typeof section[key as SectionKeys] !== "string";
		let notNumber = typeof section[key as SectionKeys] !== "number";

		if ((isSectionMKey(key) && notNumber) || (isSectionSKey(key) && notString)) {
			return null;
		}
	}

	let s = section as CourseSectionModelAPI;

	try {
		// still running .toString() and Number() parsing
		// redundant, but its okay - extra safety
		const sectionData: CourseSection = {
			dept: s.Subject.toString(),
			id: s.Course.toString(),
			avg: Number(s.Avg),
			instructor: s.Professor.toString(),
			title: s.Title.toString(),
			pass: Number(s.Pass),
			fail: Number(s.Fail),
			audit: Number(s.Audit),
			uuid: s.id.toString(),
			year: s.Section ? (s.Section === "overall" ? 1900 : Number(s.Year)) : Number(s.Year)
		};

		// this is also redundant but its okay
		// extra safety
		for (let value of Object.values(sectionData)) {
			if (Number.isNaN(value)) {
				return null;
			}

			if (value === null || value === undefined) {
				return null;
			}
		}

		return sectionData;

	} catch (err) {
		return null;
	}
};


async function getZipFilesContent (zip: JSZip) {
	let promises: Array<Promise<string>> = [];

	Object.keys(zip.files).forEach((filename, i ) => {
		let promise = zip.files[filename].async("string");
		promises.push(promise);
	});

	return await Promise.all(promises);
}

function getURL(url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		http.get(url, (response) => {
			let data = "";
			response.on("data", (chunk) => {
				data += chunk;
			});
			response.on("end", (status: any) => {
				if (response.statusCode === 200) {
					resolve(data);
				}

			});
		});
	});
}

export async function getGeolocation(address: string): Promise<GeoResponse>{
	let URL = GEO_API_URL + address.replace(/\s/g, "%20");
	let geol: Nullable<GeoResponse>;
	try {
		let rawData = await getURL(URL);
		const parsedData = JSON.parse(rawData);
		geol = {
			lat: parsedData["lat"],
			lon: parsedData["lon"],
			error: parsedData["error"]
		};
		return Promise.resolve(geol as GeoResponse);
	} catch (e) {
		log.debug(e);
		return Promise.reject(e);
	}
}


function printTree(node: Result<InsightQueryNode, InsightError>) {
	if (!node.ok) {
		return console.log(node.error);
	}
	let output = JSON.stringify(node.value, null, 4);
	console.log(output);
}

/**
 *
 * @param str string to match against
 * @param rx new RegExp(pattern, flags)
 * @returns counts the number of matches
 */
function countOccurences(str: string, rx: RegExp) {
	return (str.match(rx) || []).length;
}

// from https://stackoverflow.com/questions/979256/sorting-an-array-of-objects-by-property-values/979325#979325
export function sortBy(field: string, reverse: number, primer: Nullable<Primer<any>> = null): SortFunction {
	const key = primer ?
		function(x: any) {
			return primer(x[field]);
		} :
		function(x: any) {
			return x[field];
		};
	reverse = !reverse ? 1 : -1;
	return function(a: any, b: any) {
		a = key(a);
		b = key(b);
		return reverse * (+(a > b) - +(b > a));
	};
}

export function chainedSort(...comparators: SortFunction[]) {
	return (a: any, b: any) => {
		let order = 0;
		let i = 0;
		while (!order && comparators[i]) {
			order = comparators[i++](a, b);
		}
		return order;
	};
}

export function getField(str: QueryKey): ValidField {
	return str.split("_")[1] as ValidField;
}

export function getCmp(qk: QueryKey, dir: number): SortFunction {
	let field = getField(qk) as ValidField;
	if (isMField(field)) {
		return sortBy(qk, dir);;
	} else {
		return sortBy(qk, dir, (a: string) => a.toLowerCase());;
	}
}

export {
	courseSectionMapper, getZipFilesContent, printTree, countOccurences,
	checkHasProperties, isValidDataset, isValidDatasetID
};

