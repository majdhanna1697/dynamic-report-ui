import SideBar from "src/components/SideBar";
import { ActionProps } from ".";

const initSystemState = {
	theme: localStorage.getItem("theme") ? (localStorage.getItem("theme") === "dark" ? "dark" : "light") : "light",
	sideBarOpened: true,
};

const initialState = {
	...initSystemState,
};

const systemReducer = (state = initialState, action: ActionProps) => {
	switch (action.type) {
		case "CHANGE_THEME":
			const newTheme = state.theme === "light" ? "dark" : "light";
			localStorage.setItem("theme", newTheme);
			return {
				...state,
				theme: newTheme,
			};
		case "TOGGLE_SIDEBAR":
			return {
				...state,
				sideBarOpened: !state.sideBarOpened,
			};
		default:
			return state;
	}
};

export default systemReducer;
