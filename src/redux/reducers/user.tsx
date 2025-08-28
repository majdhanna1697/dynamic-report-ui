import { ActionProps } from ".";

const initUserState = {
	accessToken: localStorage.getItem("accessToken") || null,
};

const initialState = {
	...initUserState,
};

const userReducer = (state = initialState, action: ActionProps) => {
	switch (action.type) {
		case "USER_LOGIN":
			return action.payload.user;
		case "USER_LOGOUT":
			return { ...state, accessToken: null };
		default:
			return state;
	}
};

export default userReducer;
