import {InsightDataset, InsightDatasetKind} from "../controller/IInsightFacade";
import {CourseSection} from "./CourseSection";
import {Room} from "./Room";


export interface RoomDataset extends InsightDataset{
    buildings: Building[]
}

export interface SectionDataset extends InsightDataset{
    courses: Course[]
}

export interface Course {
    [key: string]: CourseSection[]
}

export interface Building{
    [key: string]: Room[]
}
