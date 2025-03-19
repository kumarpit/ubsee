import { Action, initialOptionState, OptionState } from "../types";

export const updateKeyValue = (componentKeyValues: Array<[string, string]>, id: string, value: string) => {
    for (let keyVal of componentKeyValues) {
        if (keyVal[0] === id) {
            keyVal[1] = value;
            return;
        }
    }

    componentKeyValues.push([id, value]);
}

const optionReducer = (
    state: OptionState = initialOptionState, 
    action: Action
): OptionState => {
    switch (action.type){
        case "Set orderKey direction":
            return {
                columnsComponentsValues: state.columnsComponentsValues,
                orderKeyComponentsValues: state.orderKeyComponentsValues,
                orderDir: action.payload
            }

        case "Update value for columnKey":
            let newColumnsComponentsValues = JSON.parse(JSON.stringify(state.columnsComponentsValues));
            updateKeyValue(newColumnsComponentsValues, action.payload.id, action.payload.value);
            return {
                columnsComponentsValues: newColumnsComponentsValues,
                orderKeyComponentsValues: state.orderKeyComponentsValues,
                orderDir: state.orderDir
            };

        case "Update value for orderKey":
            let newOrderKeyComponentsValues = JSON.parse(JSON.stringify(state.orderKeyComponentsValues));
            updateKeyValue(newOrderKeyComponentsValues, action.payload.id, action.payload.value);
            return {
                columnsComponentsValues: state.columnsComponentsValues,
                orderKeyComponentsValues: newOrderKeyComponentsValues,
                orderDir: state.orderDir
            };

        default:
            return state
    }
}

export default optionReducer;