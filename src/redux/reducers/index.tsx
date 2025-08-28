import { combineReducers } from "redux";
import systemReducer from "./system";
import userReducer from "./user";

export interface ActionProps {
	type: string;
	payload?: any;
}

const combinedReducers = combineReducers({
	system: systemReducer,
	user: userReducer,
});

export default combinedReducers;
