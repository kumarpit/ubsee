import { Action, ComponentTree, initialWhereState, WhereState } from "../types";


function addChildComponent(componentTree: ComponentTree, parentId: string, component: ComponentTree): [boolean, number] {
    if (parentId === componentTree.component.props.id){
        component.level = componentTree.level + 1;
        
        if (componentTree.children) {
            componentTree.children =  [...componentTree.children, component];
        } else {
            componentTree.children = [component];
        } 
        
        return [true, componentTree.level + 1];
    }
    if (!componentTree.children) return [false, 0];
    
    let children = componentTree.children;
    for (let child of children){
        let res = addChildComponent(child, parentId, component); 
        if (res[0]) {
            return res;
        }
    }
    
    return [false, 0];
}

function updateValueForComponent(componentTree: ComponentTree, id: string, value: string, type: string): boolean {
    if (!componentTree.children && componentTree.component.props.id === id) {
        if (type === "value") {
            componentTree.component.props.value = value;
        } else {
            componentTree.component.props.field = value;
        }
        return true;
    };
    if (!componentTree.children) return false;
    let children = componentTree.children;
    for (let child of children!) {    
        if (updateValueForComponent(child, id, value, type)) {
            return true;
        }
    }

    return false; 
}

// filter components will store tuples [level, component], always keep it sorted on level
// indent based on level

const whereReducer = (
    state: WhereState = initialWhereState, 
    action: Action
): WhereState => {
    switch (action.type){
        case "Add component to tree":
            if (state.componentTree === null) {
                return {
                    filterComponents: [...state.filterComponents, [0, action.payload.component]],
                    componentTree: { ...action.payload, level: 0 }
                }
            } else {
                let parentId = action.payload.component.props.parentId;
                let newComponentTree = JSON.parse(JSON.stringify(state.componentTree));
                let level = addChildComponent(newComponentTree, parentId, action.payload)[1];
                let newFilterComponents = [...state.filterComponents, [level, action.payload.component]];
                
                newFilterComponents.sort((a, b) => {
                    if (a[0] === b[0] && a[1].children) {
                        return 1;
                    }
                    if (a[0] === b[0] && b[1].children) {
                        return - 1;
                    }
                    else {
                        return (a[0] < b[0]) ? -1 : 1;
                    } 
                }); 

                return {
                    filterComponents: newFilterComponents as any,
                    componentTree: newComponentTree
                }
            }
        case "Update value for something": 
            let newComponentTree = JSON.parse(JSON.stringify(state.componentTree));
            updateValueForComponent(newComponentTree, action.payload.id, action.payload.value, action.payload.type);
            return {
                filterComponents: state.filterComponents,
                componentTree: newComponentTree
            };
        default:
            return state;
    }
}

export default whereReducer;