import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./reducers";

const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.REACT_APP_ENV === "development",
	middleware: (getDefaultMiddleware) => getDefaultMiddleware(),
});

export default store;
