import { Action, initialTransformationState, TransformationState } from "../types";
import { updateKeyValue } from "./optionReducer";

const updateApplyInputValue = (currValues: Array<[string, any]>, applyInput: any) => {
    switch (applyInput.type) {
        case "applyToken":
            for (let at of currValues) {
                if (at[0] === applyInput.id) {
                    at[1].token = applyInput.value;
                    return;
                }
            }
            currValues.push([applyInput.id, {
                token: applyInput.value,
                applyColumn: "",
                column: ""
            }])
        case "applyColumn":
            for (let at of currValues) {
                if (at[0] === applyInput.id) {
                    at[1].applyColumn = applyInput.value;
                    return;
                }
            }
            currValues.push([applyInput.id, {
                token: "AVG",
                applyColumn: applyInput.value,
                column: ""
            }])
        case "column":
            for (let at of currValues) {
                if (at[0] === applyInput.id) {
                    at[1].column = applyInput.value;
                    return;
                }
            }
            currValues.push([applyInput.id, {
                token: "AVG",
                applyColumn: "",
                column: applyInput.value
            }])
    }
}

const transformationReducer = (
    state: TransformationState = initialTransformationState, 
    action: Action
): TransformationState => {
    switch (action.type){   
        case "Update value for groupKey": 
            let newGroupKeyComponentsValues = JSON.parse(JSON.stringify(state.groupKeyComponentsValues));
            updateKeyValue(newGroupKeyComponentsValues, action.payload.id, action.payload.value);
            return {
                groupKeyComponentsValues: newGroupKeyComponentsValues,
                applyInputComponentsValues: state.applyInputComponentsValues
            }

        case "Update value for applyInput":
            let newApplyInputValues = JSON.parse(JSON.stringify(state.applyInputComponentsValues));
            updateApplyInputValue(newApplyInputValues, action.payload);
            return {
                groupKeyComponentsValues: state.groupKeyComponentsValues,
                applyInputComponentsValues: newApplyInputValues 
            }
        
        default:
            return state
    }
}

export default transformationReducer;