import JSZip from "jszip";
import {parse} from "parse5";
import {Element} from "parse5/dist/tree-adapters/default";
import path from "path";
import {Nullable} from "../types/Constants";
import {CourseSection} from "../types/CourseSection";
import {RoomDataset, SectionDataset} from "../types/Dataset";
import {Room} from "../types/Room";
import {RoomHtml} from "../types/RoomHtml";
import {
	checkHasProperties, courseSectionMapper, getGeolocation,
	getZipFilesContent, isValidDataset, isValidDatasetID
} from "../utils/Utils";
import {Logging} from "../utils/logger/LogManager";
import {DiskAccessHelper} from "../helpers/Dataset/DiskAccessHelper";
import {InsightDataset, InsightDatasetKind, InsightError, NotFoundError} from "./IInsightFacade";
import {
	getBuildingAddress, getBuildingFullNameFromHtml,
	getBuildingsFromIndex, getHtmlBody, getValuesFromTable
} from "../helpers/Dataset/RoomAccessHelper";

Logging.registerConsoleLogger();
const log = Logging.getLogger();

// reject with insight error
export default class DatasetController {
	public datasetIDs: string[];
	public courseSectionMap: Map<string, any>;
	public buildingRoomMap: Map<string, any>;
	public sectionDatasetArray: SectionDataset[];
	public roomDatasetArray: RoomDataset[];
	public allDatasetsArray: InsightDataset[];
	public errorText: string;
	public coursesDatasetFilePath = path.resolve(__dirname,"../../data/coursesDataset.json");
	public roomsDatasetFilePath = path.resolve(__dirname,"../../data/roomsDataset.json");
	public dirPath = path.resolve(__dirname, "../../data");
	private diskAccessHelper: DiskAccessHelper;

	constructor(){
		// load all the datasetIDs from the data folder that persists on disk
		this.diskAccessHelper = new DiskAccessHelper(this);
		this.errorText = "";
		this.sectionDatasetArray = [];
		this.roomDatasetArray = [];
		this.allDatasetsArray = [];
		this.datasetIDs = [];
		this.courseSectionMap = new Map();
		this.buildingRoomMap = new Map();
		this.diskAccessHelper.readFromDisk();
	}

	public async addDatasetHelper(datasetID: string,
		datasetContent: string, kind: InsightDatasetKind): Promise<string[]>{
		try {
			this.courseSectionMap.clear();
			if(!isValidDatasetID(datasetID)){
				return Promise.reject(new InsightError("Invalid dataset ID"));
			}
			if(this.includesDatasetID(datasetID)){
				return Promise.reject(new InsightError(`Dataset with ID ${datasetID} already exists`));
			}
			let zip = await JSZip.loadAsync(Buffer.from(datasetContent, "base64"));
			if(!isValidDataset(zip, kind)){
				return Promise.reject(new InsightError(this.errorText));
			}
			if(kind === InsightDatasetKind.Rooms){
				await this.addRoomsDataset(zip, datasetID, datasetContent);
				if(this.buildingRoomMap.size === 0){
					return Promise.reject(new InsightError ("Invalid dataset! Does not contain any valid rooms"));
				}
			}else{
				await this.addSectionsDataset(zip, datasetID, datasetContent);
				if(this.courseSectionMap.size === 0){
					return Promise.reject(new InsightError ("Invalid dataset! Does not contain any valid sections"));
				}
			}
			this.diskAccessHelper.writeToDisk(datasetID, kind);
			this.datasetIDs.push(datasetID);
			return Promise.resolve(this.datasetIDs);
		} catch(err) {
			return Promise.reject(new InsightError("Invalid dataset!"));
		}
	}

	private async addSectionsDataset(zip: JSZip, datasetID: string, datasetContent: string){
		let courseContent: string[] = await getZipFilesContent(zip);
		let keys = Object.keys(zip.files);
		for(let i = 0; i < keys.length; i++){
			let filename: string = keys[i].substring(8);
			if(filename === ""){
				continue;
			}
			let sectionDataList: CourseSection[] = [];
			let parsedData;
			try {
				parsedData = JSON.parse(courseContent[i]);
			} catch (err) {
				continue;
			}
			if (parsedData.result){
				let result = parsedData.result;
				if(result.length > 0){
					for(let section of result){
						if(checkHasProperties(section, InsightDatasetKind.Sections)){
							let mappedSection: Nullable<CourseSection> = courseSectionMapper(section);
							if (mappedSection) {
								sectionDataList.push(courseSectionMapper(section) as CourseSection);
							}
						}
					}
				}
				if(sectionDataList.length > 0){
					this.courseSectionMap.set(`${filename}`, sectionDataList);
				}
			}
		}
	}

	private async checkIndexFile(zip: JSZip): Promise<Set<string>>{
		let indexHtm = await zip.files["index.htm"].async("string");
		let document = parse(indexHtm);
		let htmlBody = getHtmlBody(document);
		let buildingsInIndex: Set<string>;
		if(htmlBody){
			buildingsInIndex = getBuildingsFromIndex(htmlBody);
			return Promise.resolve(buildingsInIndex);
		}
		return Promise.reject("Could not be resolved");
	}

	private async getRoomsInBuilding(shortName: string, htmlBody: Element): Promise<Room[]> {
		let rooms: Room[] = [];
		let roomsHtml: RoomHtml[] = getValuesFromTable(htmlBody);

		// get the tds in the table from the building file getTDsFromTable()
		// extract room capacity, room number, room type, room furniture, and the link from the table tds
		// extract the buildling fullname from the html h2 getBuildingFullName
		// extract the building shortname from the filename getBuildingShortName
		// extract the address from the html getRoomAddress
		// get the lat and long from the api

		let fullName = getBuildingFullNameFromHtml(htmlBody);
		let address = getBuildingAddress(htmlBody);
		try {
			let geol = await getGeolocation(address);
			if (!geol.error || geol.error === undefined) {
				let n = roomsHtml.length;
				for(let i = 0; i < n ;i++){
					let room: Room = {
						fullname: fullName,
						shortname: shortName,
						number: roomsHtml[i].number,
						name: shortName + "_" + roomsHtml[i].number,
						address: address,
						lat: geol.lat as number,
						lon: geol.lon as number,
						seats: roomsHtml[i].seats,
						type: roomsHtml[i].type,
						furniture: roomsHtml[i].furniture,
						href: roomsHtml[i].href
					};
					rooms.push(room);
				}
			} else {
				log.debug(shortName + " has wrong geo location");
				return Promise.reject("some error occured");
			}
			return Promise.resolve(rooms);
		} catch (e) {
			log.debug(e);
			return Promise.reject(e);
		}
	}

	private async addRoomsDataset(zip: JSZip, datasetID: string, datasetContent: string){
		let buildingContent: string[] = await getZipFilesContent(zip);
		let buildingsIndex: Set<string> = await this.checkIndexFile(zip);
		let keys = Object.keys(zip.files);
		let buildingShortNames: string[] = [];
		let promises: any[] = [];
		let skip = "campus/discover/buildings-and-classrooms/";

		for(let i = 0; i < keys.length; i++){
			let filename: string = keys[i].substring(keys[i].indexOf(skip) + skip.length);
			let buildingShortName = filename.slice(0,-4);
			if(filename !== "" && buildingsIndex.has(buildingShortName)){
				let parsedData;
				try{
					parsedData = parse(buildingContent[i]);
				}catch(err){
					log.debug(err);
				}
				if(parsedData){
					let htmlBody: Nullable<Element> = getHtmlBody(parsedData);
					if(htmlBody){
						buildingShortNames.push(buildingShortName);
						promises.push(this.getRoomsInBuilding(buildingShortName, htmlBody));
					}
				}
			}
		}
		await Promise.all(promises).then((rooms) => {
			for (let i in rooms) {
				if (rooms[i].length > 0) {
					this.buildingRoomMap.set(buildingShortNames[i], rooms[i]);
				}
			}
			// log.debug(this.buildingRoomMap);
		}).catch((e) => {
			log.debug(e);
		});
	}

	public async removeDatasetHelper(datasetID: string): Promise<string> {
		try {
			// check for valid datasetID: InsightError
			if(!isValidDatasetID(datasetID)){
				return Promise.reject(new InsightError("Invalid dataset ID"));
			}
			// check if datasetID has been added yet : NotFoundError
			if(!this.includesDatasetID(datasetID)){
				return Promise.reject(new NotFoundError(`Dataset with ID ${datasetID} does not exist`));
			}
			// remove dataset from allDatasetsArray
			let removedDataset: Nullable<InsightDataset> = null;
			this.allDatasetsArray = this.allDatasetsArray.filter((dataset: InsightDataset) => {
				if(dataset.id === datasetID){
					removedDataset = dataset;
				}
				return dataset.id !== datasetID;
			});
			// remove dataset from array of whatever kind it is
			let kind: InsightDatasetKind = InsightDatasetKind.Sections;
			if(removedDataset !== null){
				kind =  (removedDataset as InsightDataset).kind;
			}
			if(kind === InsightDatasetKind.Rooms){
				this.roomDatasetArray = this.roomDatasetArray.filter((dataset: RoomDataset) => {
					return dataset.id !== datasetID;
				});
			}else{
				this.sectionDatasetArray = this.sectionDatasetArray.filter((dataset: SectionDataset) => {
					return dataset.id !== datasetID;
				});
			}
			// remove dataset from datasetIDs
			this.datasetIDs = this.datasetIDs.filter((id) => {
				return datasetID !== id;
			});
			// remove dataset from dataset.json by rewriting only the file that got edited
			this.diskAccessHelper.writeDatasetArrayToDisk(kind);
			return Promise.resolve(datasetID);
		} catch (err) {
			return Promise.reject(new InsightError("Unable to remove dataset."));
		}
	}


	public async listDatasetHelper(): Promise<InsightDataset[]>{
		// if the dataset.json is present then show each datasetID, numRows, and type
		let datasets: InsightDataset[] =  [];
		datasets = datasets.concat(this.sectionDatasetArray.map( (element: InsightDataset) => {
			return {
				id: element.id,
				kind: element.kind,
				numRows: element.numRows
			} as InsightDataset;
		}));
		datasets = datasets.concat(this.roomDatasetArray.map( (element: InsightDataset) => {
			return {
				id: element.id,
				kind: element.kind,
				numRows: element.numRows
			} as InsightDataset;
		}));
		return Promise.resolve(datasets);
	}

	public getDataset(id: string): Nullable<InsightDataset> {
		for (let ds of this.sectionDatasetArray) {
			if (ds.id === id) {
				return ds;
			}
		}

		for (let ds of this.roomDatasetArray) {
			if (ds.id === id) {
				return ds;
			}
		}
		return null;
	}

	public includesDatasetID(datasetID: string): boolean{
		if(this.datasetIDs.includes(datasetID)){
			return true;
		}
		return false;
	}
}
