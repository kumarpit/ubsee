export type Nullable<T> = T | null;
export const EMPTY_STRING = "";
export const GEO_API_URL = "http://cs310.students.cs.ubc.ca:11316/api/v1/project_team126/";

// from https://stackoverflow.com/questions/69654873/can-i-define-a-typescript-type-as-all-possible-resulting-values-from-typeof/69655302#69655302
const uselessVariable = typeof (1 as any);
export type JSTypes = typeof uselessVariable;
