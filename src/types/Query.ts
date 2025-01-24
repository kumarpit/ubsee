import {InsightQueryNode} from "../helpers/Query/InsightQueryNode";
import {CourseSection} from "./CourseSection";
import {Room} from "./Room";
import {XOR} from "./XOR";

export interface Query {
    WHERE: object,
    OPTIONS: Options,
	TRANSFORMATIONS?: Transformations;
}

export interface Options {
    COLUMNS: QueryKey[],
    ORDER?: Order
}

export interface Transformations {
	GROUP: QueryKey[],
	APPLY: any[]
}

export type Order = QueryKey | Sort;

// keys can also be transformation keys
export interface Sort {
	dir: Direction,
	keys: QueryKey[]
}

export type QueryKey = `${string}_${SectionField}` | `${string}_${RoomField}`;

export const SECTION_MFIELDS = [
	"avg",
	"pass",
	"fail",
	"audit",
	"year"
] as const;

export const SECTION_SFIELDS = [
	"dept",
	"id",
	"instructor",
	"title",
	"uuid"
] as const;

export type SectionMField = typeof SECTION_MFIELDS[number];
export type SectionSField = typeof SECTION_SFIELDS[number];
export type SectionField = SectionMField | SectionSField;

export const ROOM_MFIELDS = [
	"lat",
	"lon",
	"seats"
] as const;

export const ROOM_SFIELDS = [
	"fullname",
	"shortname",
	"number",
	"name",
	"address",
	"type",
	"furniture",
	"href"
] as const;

export type RoomMField = typeof ROOM_MFIELDS[number];
export type RoomSField = typeof ROOM_SFIELDS[number];
export type RoomField = RoomMField | RoomSField;

export type ValidField = SectionField | RoomField;
export type MathField = SectionMField | RoomMField;
export type StringField = SectionSField | RoomSField;

export const ROOMS = "ROOMS";
export const SECTIONS = "SECTIONS";
export type DatasetTypes = typeof ROOMS | typeof SECTIONS;

export enum KeyType {
    STRING,
    MATH
}

export const COMPARATORS = [
	"AND",
	"OR",
	"LT",
	"GT",
	"EQ",
	"IS",
	"NOT"
] as const;

export type Comparator = typeof COMPARATORS[number];

export const FILTER_TYPES = [
	"MCOMPARISON",
	"SCOMPARISON",
	"LOGICCOMPARISON",
	"NEGATION",
	"_ALL"
] as const;

export type FilterTypes = typeof FILTER_TYPES[number];

export type CompFunc = (q: InsightQueryNode, sections: Array<XOR<CourseSection, Room>>, isNegated: boolean) =>
Array<XOR<CourseSection, Room>>;

export const DIRECTION = [
	"UP",
	"DOWN"
] as const;

export type Direction = typeof DIRECTION[number];

export const MAPPLY_TOKENS = [
	"MAX",
	"MIN",
	"AVG",
	"SUM"
] as const;

export const COUNT_APPLY_TOKEN = "COUNT" as const;

export type MApplyToken = typeof MAPPLY_TOKENS[number];
export type ApplyToken = MApplyToken | typeof COUNT_APPLY_TOKEN;

export type Primer<T> = (a: T) => T;
export type SortFunction = (a: any, b: any) => number;

export interface ApplyObject{
	APPLYKEY: string,
	APPLYTOKEN: ApplyToken,
	QUERYKEY: QueryKey
}

export type MatchFunc = (actual: string | number, expected: string | number) => boolean;
