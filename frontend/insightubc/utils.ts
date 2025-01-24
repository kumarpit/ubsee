import { ComponentTree, OptionState, TransformationState, WhereState } from "./state/types";

function recursiveParseWhereState(datasetID: string, componentTree: ComponentTree): Object{
    let props = componentTree.component.props;
    let filter = props.filter;
    if(!componentTree.children){ // Leaf node
        let field = checkAppend(props.field)? datasetID + "_" + props.field: props.field;
        let value: string = props.value;
        let leafNode = {
            [filter]: {
                [field]: filter !== "IS"? parseInt(value): value
            }
        }
        return leafNode;
    }else{ // Non-leaf node
        let childFilters: Array<Object> = []
        for(let child of componentTree.children){
            childFilters.push(recursiveParseWhereState(datasetID, child));
        }

        let nonLeafNode = {
            [filter]: childFilters
        }
        return nonLeafNode;
    }
}

function parseWhereState(datasetID:string, whereState: WhereState): Object{
    let componentTree = whereState.componentTree;
    if(componentTree){
        return recursiveParseWhereState(datasetID, componentTree);
    }else{
        return {};
    }
}

function checkAppend(key: string): boolean{
    const arr = ["lat", "lon", "seats", "avg", "pass", "fail", "audit", "year",
                 "dept", "id", "instructor", "title", "uuid",
                 "fullname","shortname","number","name","address","type","furniture","href"];
    if(arr.includes(key)){
        return true;
    }
    return false;
}

function appendToDatasetID(datasetID: string, key: string): string{
    if(checkAppend(key)){
        return datasetID + "_" + key;
    }
    else return key;
}

function parseOptionState(datasetID: string, optionState: OptionState): Object{
    let columnKeys: Array<string> = optionState.columnsComponentsValues.map((arr: Array<string>) => arr[1]);
    let orderKeys: Array<string>= optionState.orderKeyComponentsValues.map((arr:Array<string>) => arr[1]);
    let orderDir: string = optionState.orderDir;
    columnKeys = columnKeys.map( (columnKey) => appendToDatasetID(datasetID, columnKey))
    orderKeys = orderKeys.map( (orderKey) => appendToDatasetID(datasetID, orderKey))
    let OPTIONS: any = {
        COLUMNS: columnKeys
    }
    if(orderKeys.length !== 0){
        OPTIONS.ORDER = {
            keys: orderKeys,
            dir: orderDir
        }
    }
    return OPTIONS;
}

function convertApplyToParsedFormat(datasetID:string, applyObjects: Array<any>){
    for(let i=0 ; i < applyObjects.length; i++){
        applyObjects[i] = {
            [applyObjects[i].applyColumn]:{
                [applyObjects[i].token] : datasetID + "_" + applyObjects[i].column
            }
        }
    }
}

function parseTransformationState(datasetID: string, transformationState: TransformationState): Object{
    let groupKeys: Array<string> = transformationState.groupKeyComponentsValues.map((arr: Array<string>) => arr[1]);
    let applyObjects: Array<object> = transformationState.applyInputComponentsValues.map((arr: Array<Object>) => arr[1]);
    convertApplyToParsedFormat(datasetID, applyObjects);
    if(groupKeys.length === 0 || applyObjects.length === 0){
        return {};
    }
    groupKeys = groupKeys.map( (groupKey) => appendToDatasetID(datasetID, groupKey))
    let TRANSFORMATIONS = {
        GROUP: groupKeys,
        APPLY: applyObjects
    }
    return TRANSFORMATIONS;
}

function createQuery(parsedWhereState: Object, parsedOptionState: Object, parsedTransformationState: Object): Object{
    let query: any = {
        WHERE: parsedWhereState,
        OPTIONS: parsedOptionState
    };
    if(Object.keys(parsedTransformationState).length !== 0){
        query.TRANSFORMATIONS = parsedTransformationState
    }
    return query;
}

function getQuery(datasetID: string, whereState: WhereState, optionState: OptionState, transformationState: TransformationState){
    let parsedWhereState = parseWhereState(datasetID, whereState);
    let parsedOptionState = parseOptionState(datasetID, optionState);
    let parsedTransformationState = parseTransformationState(datasetID, transformationState);
    let query = createQuery(parsedWhereState, parsedOptionState, parsedTransformationState);
    return query;
}

export {getQuery};