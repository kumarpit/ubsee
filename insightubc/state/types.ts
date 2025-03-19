import ApplyInputComponent from "../components/ApplyInputComponent"

export type FilterComponentList = {
    filters: Array<JSX.Element>
}

export type ComponentTree = {
    component: JSX.Element,
    children?: Array<ComponentTree>,
    level: number
}

export type WhereState = {
    filterComponents: Array<[number, JSX.Element]>,
    componentTree: ComponentTree | null,
    // currLevel: number
}

export type OptionState = {
    columnsComponentsValues: Array<[string, string]>,
    orderKeyComponentsValues: Array<[string, string]>,
    orderDir: string
}

export type TransformationState = {
    groupKeyComponentsValues: Array<[string, string]>,
    applyInputComponentsValues: Array<[string, object]>
}

export type State = {
    whereState: WhereState,
    optionState: OptionState,
    transformationState: TransformationState
}

export const initialWhereState: WhereState = {
    filterComponents: [],
    componentTree: null,
}

export const initialOptionState: OptionState = {
    columnsComponentsValues: [],
    orderKeyComponentsValues: [],
    orderDir: "UP"
}

export const initialTransformationState: TransformationState = {
    groupKeyComponentsValues: [],
    applyInputComponentsValues: []
}


export type Action = {
    type: string,
    payload?: any
}