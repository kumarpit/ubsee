export enum LeafTypes {
    GT = "GT",
    LT = "LT",
    EQ = "EQ",
    IS = "IS"
}

export interface LeafType {
   field: LeafTypes
}

export enum NonLeafTypes {
    AND = "AND",
    OR = "OR",
    NOT = "NOT",
}

interface NonLeafType{
    field: NonLeafTypes
}