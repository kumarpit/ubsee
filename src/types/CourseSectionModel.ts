export interface UnknownCourseSectionModelAPI {
	Subject: unknown;
	id: unknown;
	Avg: unknown;
	Professor: unknown;
	Title: unknown;
	Pass: unknown;
	Fail: unknown;
	Audit: unknown;
	Course: unknown;
	Year: unknown;
	Section?: unknown;
}

export interface CourseSectionModelAPI {
	Subject: string;
	id: number;
	Avg: number;
	Professor: string;
	Title: string;
	Pass: number;
	Fail: number;
	Audit: number;
	Course: string;
	Year: number;
	Section?: string;
}

export const SECTION_KEYS = [
	"Subject",
	"id",
	"Avg",
	"Professor",
	"Title",
	"Pass",
	"Fail",
	"Audit",
	"Course",
	"Year",
	"Section"
] as const;


const SECTION_STRING_KEYS = [
	"Subject",
	"Professor",
	"Title",
	"Course",
	"Section",
	"Year"
] as const;

const SECTION_MATH_KEYS = [
	"id",
	"Avg",
	"Pass",
	"Fail",
	"Audit"
] as const;

export type SectionMathKeys = typeof SECTION_MATH_KEYS[number];
export type SectionStringKeys = typeof SECTION_STRING_KEYS[number];
export type SectionKeys = typeof SECTION_KEYS[number]

export function isSectionKey(key: string): boolean {
	const s: readonly string[] = SECTION_KEYS;
	return s.includes(key);
}

export function isSectionSKey(key: string): boolean {
	const s: readonly string[] = SECTION_STRING_KEYS;
	return s.includes(key);
}

export function isSectionMKey(key: string): boolean {
	const s: readonly string[] = SECTION_MATH_KEYS;
	return s.includes(key);
}
