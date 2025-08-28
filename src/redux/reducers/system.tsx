import { ActionProps } from ".";

const initSystemState = {
	theme: localStorage.getItem("theme") ? (localStorage.getItem("theme") === "dark" ? "dark" : "light") : "light",
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
		default:
			return state;
	}
};

export default systemReducer;
