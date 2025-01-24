import {configureStore} from "@reduxjs/toolkit"
import optionReducer from "./reducers/optionReducer";
import transformationReducer from "./reducers/transformationReducer";
import whereReducer from "./reducers/whereReducer";


const store = configureStore({
    reducer: { 
        whereState: whereReducer,
        optionState: optionReducer,
        transformationState: transformationReducer
     }, 
    middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
});

export default store;