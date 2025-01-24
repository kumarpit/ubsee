import fs from "fs";
import path from "path";
import {Building, Course, RoomDataset, SectionDataset} from "../../types/Dataset";
import DatasetController from "../../controller/DatasetController";
import {InsightDataset, InsightDatasetKind} from "../../controller/IInsightFacade";

export class DiskAccessHelper{
    // change this inhertiance to taking an instance of dc into the constructor somehow

	private datasetController: DatasetController;

	constructor(dc: DatasetController){
		this.datasetController = dc;
	}

	public writeSectionsToDisk(datasetID: string){
		let coursesObj: Course = Object.fromEntries(this.datasetController.courseSectionMap); // {course1:[], course2:[]}
		let coursesArr: Course[] = []; // [course1:[], course2:[]]

		Object.entries(coursesObj).forEach( (element) => {
			let key = element[0];
			let value = element[1];
			coursesArr.push({
				[key]: value
			});
		});

		let rowCount = 0;
		this.datasetController.courseSectionMap.forEach((section) => {
			rowCount += section.length;
		});

		let dataset: SectionDataset = {
			id: datasetID,
			courses: coursesArr as Course[],
			numRows: rowCount,
			kind: InsightDatasetKind.Sections
		};
		this.datasetController.sectionDatasetArray.push(dataset); // [dataset1, dataset2, dataset3]
		this.datasetController.allDatasetsArray.push(dataset);
	}

	public writeRoomsToDisk(datasetID: string){
		let buildingsObj: Building = Object.fromEntries(this.datasetController.buildingRoomMap); // {building1: [], building2: []}
		let buildingsArr: Building[] = [];

		Object.entries(buildingsObj).forEach( (element)=> {
			let key = element[0];
			let value = element[1];
			buildingsArr.push({
				[key]: value
			});
		});

		let rowCount = 0;
		this.datasetController.buildingRoomMap.forEach((room) => {
			rowCount += room.length;
		});

		let dataset: RoomDataset = {
			id: datasetID,
			buildings: buildingsArr as Building[],
			numRows: rowCount,
			kind: InsightDatasetKind.Rooms
		};
		this.datasetController.roomDatasetArray.push(dataset); // [rooms1, rooms2, rooms3]
		this.datasetController.allDatasetsArray.push(dataset);
	}

	public writeToDisk(datasetID: string, kind: InsightDatasetKind){
		if(kind === InsightDatasetKind.Sections){

			this.writeSectionsToDisk(datasetID);
			this.writeDatasetArrayToDisk(kind);
		} else{

			this.writeRoomsToDisk(datasetID);
			this.writeDatasetArrayToDisk(kind);
		}
	}

	public writeDatasetArrayToDisk(kind: InsightDatasetKind) {
		let datasets: any = {};
		let arrayToWrite: InsightDataset[];
		let filePath: string;

		if(kind === InsightDatasetKind.Rooms){
			arrayToWrite = this.datasetController.roomDatasetArray;
			filePath = this.datasetController.roomsDatasetFilePath;
		}else{
			arrayToWrite = this.datasetController.sectionDatasetArray;
			filePath = this.datasetController.coursesDatasetFilePath;
		}

		arrayToWrite.forEach( (element: InsightDataset) => {
			let id: string = element.id;
			datasets[id] = element;
		});

		let content = JSON.stringify({datasets: datasets});

		if (!fs.existsSync(this.datasetController.dirPath)) {
			fs.mkdirSync( path.resolve(__dirname,"../../../data") );
		}

        // overwrite exisitng file
		fs.writeFileSync(filePath, content);

	}

	public readFromDisk(){
		this.readDatasetOnKind(InsightDatasetKind.Sections);
		this.readDatasetOnKind(InsightDatasetKind.Rooms);
	}

	public readDatasetOnKind(kind: InsightDatasetKind){
		try{
			if(kind === InsightDatasetKind.Sections){
				if (fs.existsSync(this.datasetController.coursesDatasetFilePath)){
					let datasets = JSON.parse(fs.readFileSync(this.datasetController
						.coursesDatasetFilePath).toString())["datasets"];

					Object.keys(datasets).forEach( (element) => {
						let sectionDataset: SectionDataset = datasets[element];
						this.datasetController.allDatasetsArray.push(sectionDataset);
						this.datasetController.sectionDatasetArray.push(sectionDataset);
						let courses = sectionDataset.courses;
						this.datasetController.courseSectionMap = new Map(Object.entries(courses as Course[]));
					});
					this.datasetController.datasetIDs = this.datasetController.datasetIDs.concat(Object.keys(datasets));
				}
			}else{
				if(fs.existsSync(this.datasetController.roomsDatasetFilePath)){
					let roomDatasets = JSON.parse(fs.readFileSync(this.datasetController.roomsDatasetFilePath)
						.toString())["datasets"];

					Object.keys(roomDatasets).forEach( (element) => {
						let roomDataset: RoomDataset = roomDatasets[element];
						this.datasetController.allDatasetsArray.push(roomDataset);
						this.datasetController.roomDatasetArray.push(roomDataset);
						let buildings = roomDataset.buildings;
						this.datasetController.buildingRoomMap = new Map(Object.entries(buildings as Building[]));
					});
					this.datasetController.datasetIDs = this.datasetController.datasetIDs
						.concat(Object.keys(roomDatasets));
				}
			}
		}catch(err){
			console.log("Hmm...encountered a corrupted sectionsDataset.json or roomsDataset.json in ./data");
		}

	}
}
